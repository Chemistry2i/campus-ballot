import{z as d,E as f,af as m,cJ as p,H as g,cK as h,cL as u,K as v,J as b,j as o,F as c,cM as y,cN as w}from"./index-C0kZtT3H.js";function j({stats:r}){const{isDarkMode:t,colors:i}=d(),l="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-15",x=[{icon:f,title:"Users",value:r?.totalUsers??0,color:"#0d6efd",bgColor:"#f8f9fa",description:"Total Registered"},{icon:m,title:"Votes",value:r?.totalVotes??0,color:"#198754",bgColor:"#f8f9fa",description:"Votes Cast"},{icon:p,title:"Elections",value:r?.totalElections??0,color:"#ffc107",bgColor:"#f8f9fa",description:"Total Elections"},{icon:g,title:"Candidates",value:r?.totalCandidates??0,color:"#0dcaf0",bgColor:"#f8f9fa",description:"Total Candidates"},{icon:h,title:"Active",value:r?.activeElections??0,color:"#198754",bgColor:"#f8f9fa",description:"Active Elections"},{icon:u,title:"Pending",value:r?.pendingApprovals??0,color:"#fd7e14",bgColor:"#f8f9fa",description:"Pending Items"},{icon:v,title:"Alerts",value:r?.totalNotifications??0,color:"#dc3545",bgColor:"#f8f9fa",description:"Notifications"},{icon:b,title:"Logs",value:r?.totalLogs??0,color:"#6c757d",bgColor:"#f8f9fa",description:"System Logs"}],n=(e,s,a)=>{a?(e.currentTarget.style.transform="translateY(-3px)",e.currentTarget.style.boxShadow=t?"none":"0 10px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)",e.currentTarget.style.borderColor=s.color):(e.currentTarget.style.transform="translateY(0)",e.currentTarget.style.boxShadow=t?"none":"0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",e.currentTarget.style.borderColor=t?i.border:"#e9ecef")};return o.jsxs("div",{className:"container-fluid px-0",children:[o.jsx("div",{className:"row g-3 mb-4",children:x.map((e,s)=>o.jsx("div",{className:l,style:{flex:"1 1 12.5%",maxWidth:"12.5%"},children:o.jsx("div",{className:`card h-100 ${t?"overview-card-dark":""}`,style:{backgroundColor:t?i.surface:e.bgColor,transition:"all 0.3s ease",cursor:"pointer",minHeight:"120px",border:`2px solid ${t?i.border:"#e9ecef"}`,borderRadius:"12px",overflow:"hidden",boxShadow:t?"none":"0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)"},onMouseEnter:a=>n(a,e,!0),onMouseLeave:a=>n(a,e,!1),role:"button",tabIndex:0,"aria-label":`${e.title}: ${e.value} ${e.description}`,children:o.jsxs("div",{className:"card-body text-center py-2 px-2 d-flex flex-column justify-content-center h-100",style:{borderRadius:"inherit"},children:[o.jsx("div",{className:"mb-1",children:o.jsx("div",{className:"d-inline-flex align-items-center justify-content-center rounded-circle mx-auto",style:{width:"40px",height:"40px",backgroundColor:`${e.color}15`,border:`2px solid ${e.color}`,boxShadow:t?"none":`0 2px 4px ${e.color}20`},children:o.jsx(c,{icon:e.icon,size:"sm",style:{color:e.color},title:e.description,"aria-hidden":"true"})})}),o.jsx("div",{className:"mb-1",style:{fontSize:"0.8rem",fontWeight:"600",color:t?i.textSecondary:"#6c757d",textTransform:"uppercase",letterSpacing:"0.3px",lineHeight:"1.1"},children:e.title}),o.jsx("div",{className:"mb-1",style:{fontSize:"1.2rem",fontWeight:"700",color:e.color,lineHeight:"1",textShadow:"0 1px 2px rgba(0, 0, 0, 0.1)"},children:typeof e.value=="number"?e.value.toLocaleString():e.value}),o.jsx("div",{className:"small text-muted",style:{fontSize:"0.8rem",lineHeight:"1.1"},children:o.jsx("span",{style:{color:t?i.textMuted:void 0},children:e.description})})]})})},s))}),o.jsx("style",{children:`
        /* Override darkmode.css card styles for overview cards */
        body.admin-dark-mode .overview-card-dark.card,
        .admin-dark-mode .overview-card-dark.card,
        .overview-card-dark.card {
          box-shadow: none !important;
        }
        
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
        
        .card:focus,
        .card:focus-visible {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
          box-shadow: 0 0 0 2px #0d6efd40;
        }
      `})]})}const T=({className:r="",showLabel:t=!1})=>{const{isDarkMode:i,toggleTheme:l}=d();return o.jsx("button",{onClick:l,className:`btn btn-outline-secondary ${r}`,style:{position:"relative",overflow:"hidden",transition:"all 0.3s ease"},title:`Switch to ${i?"light":"dark"} mode`,children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",position:"relative",zIndex:1},children:[o.jsx(c,{icon:i?y:w,style:{transition:"transform 0.3s ease",transform:i?"rotate(180deg)":"rotate(0deg)"}}),t&&o.jsx("span",{className:"d-none d-sm-inline",children:i?"Light":"Dark"})]})})};export{j as O,T};
