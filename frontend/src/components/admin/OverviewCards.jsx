import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheckCircle,
  faPoll,
  faUserTie,
  faBell,
  faHistory,
  faHourglassHalf,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";

function OverviewCards({ stats }) {
  const cardClass = "col-6 col-sm-4 col-md-3 col-lg-3 col-xl-15";

  const cardData = [
    {
      icon: faUsers,
      title: "Users",
      value: stats?.totalUsers ?? 0,
      color: "#0d6efd",
      bgColor: "#f8f9fa",
      description: "Total Registered"
    },
    {
      icon: faCheckCircle,
      title: "Votes",
      value: stats?.totalVotes ?? 0,
      color: "#198754",
      bgColor: "#f8f9fa",
      description: "Votes Cast"
    },
    {
      icon: faPoll,
      title: "Elections",
      value: stats?.totalElections ?? 0,
      color: "#ffc107",
      bgColor: "#f8f9fa",
      description: "Total Elections"
    },
    {
      icon: faUserTie,
      title: "Candidates",
      value: stats?.totalCandidates ?? 0,
      color: "#0dcaf0",
      bgColor: "#f8f9fa",
      description: "Total Candidates"
    },
    {
      icon: faPlayCircle,
      title: "Active",
      value: stats?.activeElections ?? 0,
      color: "#198754",
      bgColor: "#f8f9fa",
      description: "Active Elections"
    },
    {
      icon: faHourglassHalf,
      title: "Pending",
      value: stats?.pendingApprovals ?? 0,
      color: "#fd7e14",
      bgColor: "#f8f9fa",
      description: "Pending Items"
    },
    {
      icon: faBell,
      title: "Alerts",
      value: stats?.totalNotifications ?? 0,
      color: "#dc3545",
      bgColor: "#f8f9fa",
      description: "Notifications"
    },
    {
      icon: faHistory,
      title: "Logs",
      value: stats?.totalLogs ?? 0,
      color: "#6c757d",
      bgColor: "#f8f9fa",
      description: "System Logs"
    }
  ];

  const handleCardHover = (e, card, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)";
      e.currentTarget.style.borderColor = `${card.color}40`;
    } else {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)";
      e.currentTarget.style.borderColor = `${card.color}20`;
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        {cardData.map((card, index) => (
          <div key={index} className={cardClass} style={{ flex: '1 1 12.5%', maxWidth: '12.5%' }}>
            <div 
              className="card border-0 h-100"
              style={{
                backgroundColor: card.bgColor,
                transition: "all 0.3s ease",
                cursor: "pointer",
                minHeight: "120px",
                border: `1px solid ${card.color}20`,
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)"
              }}
              onMouseEnter={(e) => handleCardHover(e, card, true)}
              onMouseLeave={(e) => handleCardHover(e, card, false)}
              role="button"
              tabIndex={0}
              aria-label={`${card.title}: ${card.value} ${card.description}`}
            >
              <div className="card-body text-center py-2 px-2 d-flex flex-column justify-content-center h-100">
                <div className="mb-1">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: `${card.color}15`,
                      border: `2px solid ${card.color}30`,
                      boxShadow: `0 2px 4px ${card.color}20`
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={card.icon} 
                      size="sm"
                      style={{ color: card.color }}
                      title={card.description}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                
                <div 
                  className="mb-1"
                  style={{ 
                    fontSize: "0.8rem", 
                    fontWeight: "600",
                    color: "#6c757d",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    lineHeight: "1.1"
                  }}
                >
                  {card.title}
                </div>
                
                <div 
                  className="mb-1"
                  style={{ 
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: card.color,
                    lineHeight: "1",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
                
                <div 
                  className="small text-muted"
                  style={{ 
                    fontSize: "0.8rem",
                    lineHeight: "1.1"
                  }}
                >
                  {card.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @media (max-width: 1200px) {
          .col-xl-15 {
            flex: 1 1 25% !important;
            max-width: 25% !important;
          }
        }
        
        @media (max-width: 992px) {
          .col-lg-3 {
            flex: 1 1 33.333% !important;
            max-width: 33.333% !important;
          }
        }
        
        @media (max-width: 768px) {
          .col-md-3 {
            flex: 1 1 50% !important;
            max-width: 50% !important;
          }
        }
        
        @media (max-width: 576px) {
          .col-6 {
            flex: 1 1 50% !important;
            max-width: 50% !important;
          }
          .card {
            min-height: 100px !important;
          }
          .card-body {
            padding: 0.5rem !important;
          }
        }
        
        .card:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }
        
        .card:focus-visible {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default OverviewCards;