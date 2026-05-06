import{v as y,u as b,r as o,j as e,F as n,e as w,w as l,x as j,y as v,m as x,S as r}from"./index-CTNUMgZQ.js";function S(){const{token:f}=y(),g=b(),[i,d]=o.useState(!1),[a,c]=o.useState(!1),[u,p]=o.useState(!1),m=async()=>{d(!0);try{const t=await x.get(`https://api.campusballot.tech/api/auth/verify/${f}`);r.fire("Success",t.data.message,"success"),setTimeout(()=>{g("/login")},2500)}catch(t){const s=t.response?.data?.message||"Verification failed";(s.toLowerCase().includes("expired")||s.toLowerCase().includes("invalid")||t.response?.status===400)&&p(!0),r.fire("Error",s,"error")}finally{d(!1)}},h=async()=>{const{value:t}=await r.fire({title:"Enter your email",input:"email",inputLabel:"Email address",inputPlaceholder:"Enter your email address",showCancelButton:!0,confirmButtonText:"Send Reset Link",cancelButtonText:"Cancel",inputValidator:s=>{if(!s)return"You need to enter an email address!";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))return"Please enter a valid email address!"}});if(t){c(!0);try{const s=await x.post("https://api.campusballot.tech/api/auth/resend-verification",{email:t});await r.fire({title:"Reset Link Sent!",text:s.data.message||`A new verification link has been sent to ${t}. Please check your inbox and spam folder.`,icon:"success",confirmButtonText:"Got it!",timer:5e3,timerProgressBar:!0}),p(!1)}catch(s){r.fire("Error",s.response?.data?.message||"Failed to send verification email","error")}finally{c(!1)}}};return e.jsxs("div",{style:{minHeight:"100vh",width:"100vw",background:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"},children:[e.jsxs("div",{style:{maxWidth:"450px",width:"100%",background:"white",borderRadius:"16px",boxShadow:"0 10px 40px rgba(0, 0, 0, 0.1)",overflow:"hidden",animation:"slideUp 0.5s ease-out"},children:[e.jsxs("div",{style:{background:"#667eea",padding:"40px 30px",textAlign:"center",color:"white"},children:[e.jsx("div",{style:{fontSize:"48px",marginBottom:"15px"},children:e.jsx(n,{icon:w})}),e.jsx("h2",{style:{margin:"0 0 8px 0",fontSize:"28px",fontWeight:"700"},children:"Verify Your Email"}),e.jsx("p",{style:{margin:"0",fontSize:"14px",opacity:"0.9"},children:"Confirm your email address to continue"})]}),e.jsxs("div",{style:{padding:"40px 30px"},children:[e.jsx("p",{style:{textAlign:"center",color:"#555",fontSize:"16px",lineHeight:"1.6",marginBottom:"30px"},children:"Click the button below to verify your email address and activate your account."}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx("button",{onClick:m,disabled:i||a,style:{width:"100%",padding:"14px 24px",background:"#667eea",color:"white",border:"none",borderRadius:"8px",fontSize:"16px",fontWeight:"600",cursor:i||a?"not-allowed":"pointer",transition:"all 0.3s ease",opacity:i||a?"0.6":"1",transform:"scale(1)",boxShadow:"0 4px 15px rgba(102, 126, 234, 0.3)"},onMouseOver:t=>{!i&&!a&&(t.target.style.background="#5568d3",t.target.style.boxShadow="0 6px 20px rgba(102, 126, 234, 0.4)")},onMouseOut:t=>{t.target.style.background="#667eea",t.target.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"},children:i?e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:l,style:{marginRight:"8px",animation:"spin 0.8s linear infinite"}}),"Verifying..."]}):e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:j,style:{marginRight:"8px"}}),"Verify Email Address"]})}),u&&e.jsxs("div",{style:{marginTop:"20px",paddingTop:"20px",borderTop:"1px solid #e0e0e0",animation:"fadeIn 0.4s ease-out"},children:[e.jsx("p",{style:{textAlign:"center",fontSize:"14px",color:"#999",marginBottom:"15px"},children:"Link expired or invalid?"}),e.jsx("button",{onClick:h,disabled:i||a,style:{width:"100%",padding:"12px 20px",background:"transparent",color:"#667eea",border:"2px solid #667eea",borderRadius:"8px",fontSize:"15px",fontWeight:"600",cursor:i||a?"not-allowed":"pointer",transition:"all 0.3s ease",opacity:i||a?"0.6":"1"},onMouseOver:t=>{!i&&!a&&(t.target.style.background="#667eea",t.target.style.color="white")},onMouseOut:t=>{t.target.style.background="transparent",t.target.style.color="#667eea"},children:a?e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:l,style:{marginRight:"6px",animation:"spin 0.8s linear infinite"}}),"Sending..."]}):e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:l,style:{marginRight:"6px"}}),"Resend Verification Email"]})})]})]}),e.jsxs("div",{style:{marginTop:"25px",padding:"15px",background:"#f0f4ff",border:"1px solid #d0deff",borderRadius:"8px",fontSize:"13px",color:"#555",lineHeight:"1.5",textAlign:"center"},children:[e.jsxs("strong",{style:{color:"#667eea"},children:[e.jsx(n,{icon:v,style:{marginRight:"6px"}}),"Check your inbox"]}),e.jsx("br",{}),"If you don't see the verification link, please check your spam folder."]})]})]}),e.jsx("style",{children:`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          div[style*="padding: 40px 30px"] {
            padding: 30px 20px !important;
          }
        }
      `})]})}export{S as default};
