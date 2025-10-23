import { useEffect, useState } from 'react';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Notifications({ user }) {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
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
			const token = localStorage.getItem('token');
			await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
			fetchNotifications();
		} catch (err) {
			console.error('Failed to mark notification as read', err);
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
						<div key={n._id} className={`list-group-item ${n.read ? '' : 'bg-light'}`}>
							<div className="d-flex justify-content-between align-items-start">
								<div>
									<div className="fw-bold">{n.title}</div>
									<div className="small text-muted">{n.message}</div>
									<div className="small text-muted">{new Date(n.createdAt).toLocaleString()}</div>
								</div>
								<div className="d-flex flex-column gap-2">
									{!n.read && (
										<button className="btn btn-sm btn-outline-success" onClick={() => markAsRead(n._id)}>
											<FontAwesomeIcon icon={faCheckCircle} /> Mark as read
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
