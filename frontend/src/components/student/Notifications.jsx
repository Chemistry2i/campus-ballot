import { useEffect, useState } from 'react';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTrash, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Normalize VITE_API_URL to a full URL. Some env setups may provide just a port like ":5000" —
// guard against that by prefixing localhost when necessary.
let _apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (_apiBase && _apiBase.startsWith(':')) _apiBase = `http://localhost${_apiBase}`;
axios.defaults.baseURL = _apiBase.replace(/\/$/, '');

export default function Notifications({ user }) {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [markingIds, setMarkingIds] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);
	const { socketRef } = useSocket();

	const fetchNotifications = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
			const mapped = res.data.map(n => ({ ...n, read: n.readBy && user?._id ? n.readBy.includes(user._id) : false }));
			setNotifications(mapped);
		} catch (err) {
			console.error('Failed to fetch notifications', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
		// eslint-disable-next-line
	}, []);

		useEffect(() => {
			let mounted = true;

			const setupSocket = (s) => {
				if (!mounted || !s) return;

				s.emit('join', 'students');
				if (user?._id) s.emit('join', user._id);

				const onNew = (notification) => {
					if (notification.targetAudience === 'students' || notification.targetAudience === 'all') {
						setNotifications(prev => [notification, ...(prev || [])]);
					}
				};

				const onDeleted = ({ notificationId }) => {
					setNotifications(prev => (prev || []).filter(n => n._id !== notificationId));
				};

				const onRead = ({ notificationId, userId }) => {
					setNotifications(prev => (prev || []).map(n => n._id === notificationId ? { ...n, readBy: [...(n.readBy||[]), userId] } : n));
				};

				s.on('notification:new', onNew);
				s.on('notification:deleted', onDeleted);
				s.on('notification:read', onRead);

				const cleanup = () => {
					s.off('notification:new', onNew);
					s.off('notification:deleted', onDeleted);
					s.off('notification:read', onRead);
					try { s.emit('leave', 'students'); } catch (e) { }
					if (user?._id) try { s.emit('leave', user._id); } catch (e) { }
				};

				return cleanup;
			};

			if (socketRef.current) {
				const cleanup = setupSocket(socketRef.current);
				return () => {
					mounted = false;
					if (cleanup) cleanup();
				};
			}

			const interval = setInterval(() => {
				if (socketRef.current) {
					clearInterval(interval);
					const cleanup = setupSocket(socketRef.current);
					return () => {
						mounted = false;
						if (cleanup) cleanup();
					};
				}
			}, 200);

			return () => {
				mounted = false;
				clearInterval(interval);
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [socketRef, user?._id]);

	const markAsRead = async (id) => {
		try {
	    	setMarkingIds(prev => [...prev, id]);
	    	const token = localStorage.getItem('token');
	    	await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
	    	await fetchNotifications();
	  } catch (err) {
	    	console.error('Failed to mark notification as read', err);
	  } finally {
	    	setMarkingIds(prev => prev.filter(x => x !== id));
	  }
	};

	const deleteNotification = async (id) => {
		if (!id) return;
		const confirmed = await Swal.fire({
			title: 'Delete notification?',
			text: 'This will permanently remove the notification.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			confirmButtonColor: '#d33'
		});
		if (!confirmed.isConfirmed) return;
		try {
			setDeletingIds(prev => [...prev, id]);
			const token = localStorage.getItem('token');
			await axios.delete(`/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
			setNotifications(prev => (prev || []).filter(n => n._id !== id));
		} catch (err) {
			console.error('Failed to delete notification', err);
			Swal.fire('Error', 'Failed to delete notification', 'error');
		} finally {
			setDeletingIds(prev => prev.filter(x => x !== id));
		}
	};

	return (
		<div>
			<h4 className="mb-3">Notifications</h4>
			{loading ? (
				<div>Loading...</div>
			) : notifications.length === 0 ? (
				<div className="alert alert-info"><FontAwesomeIcon icon={faInfoCircle} /> No notifications.</div>
			) : (
				<div className="list-group">
					{notifications.map(n => (
						<div
							key={n._id}
							className={`list-group-item border border-1 mb-2`}
							style={{ background: n.read ? '#ffffff' : '#f1f3f5' }}
						>
							<div className="d-flex justify-content-between align-items-start">
								<div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
									<div style={{ width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }} className={`bg-${n.type === 'success' ? 'success' : 'info'} bg-opacity-10`}> 
										<FontAwesomeIcon icon={n.type === 'success' ? faCheckCircle : faInfoCircle} style={{ color: n.type === 'success' ? '#198754' : '#0dcaf0' }} size="lg" />
									</div>
									<div style={{ minWidth: 0 }}>
										<div className="fw-bold text-truncate" style={{ maxWidth: 380 }}>{n.title}</div>
										<div className="small text-muted text-truncate" style={{ maxWidth: 380 }}>{n.message}</div>
										<div className="small text-muted">{new Date(n.createdAt).toLocaleString()}</div>
									</div>
								</div>
								<div className="d-flex flex-column gap-2">
									<div className="d-flex gap-2">
										{!n.read && (
											<button
												className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center"
												onClick={() => markAsRead(n._id)}
												disabled={markingIds.includes(n._id)}
												style={{ minWidth: 44 }}
											>
												{markingIds.includes(n._id) ? (
													<FontAwesomeIcon icon={faSpinner} spin />
												) : (
													<>
														<FontAwesomeIcon icon={faCheckCircle} className="me-0 me-sm-2" />
														<span className="d-none d-sm-inline">Mark as read</span>
													</>
												)}
											</button>
										)}
										<button
											className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
											onClick={() => deleteNotification(n._id)}
											disabled={deletingIds.includes(n._id)}
											style={{ minWidth: 44 }}
											title="Delete"
										>
											{deletingIds.includes(n._id) ? (
												<FontAwesomeIcon icon={faSpinner} spin />
											) : (
												<FontAwesomeIcon icon={faTrash} />
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
