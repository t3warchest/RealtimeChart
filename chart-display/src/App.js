import "./App.css";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import Records from "./pages/Records";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Home from "./pages/Home";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">
        <div className="page-container">
          <SideBar />
          <div className="greeter">
            <p className="welcome-line">Hello, Michel Thomas</p>
            <p>This is dashboard</p>
          </div>
          <div className="page">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/records" element={<Records />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

// import React, { useEffect, useState } from "react";
// import "./App.css";

// import ChartViewer from "./components/ChartViewer";
// import ChartDetail from "./components/ChartDetails";

// const socket = new WebSocket("ws://localhost:8080");

// function App() {
//   const [dataStream, setDataStream] = useState([{ time: 0, steps: 0 }]);
//   const [showDiv, setShowDiv] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   const mountedStyle = { animation: "inAnimation 400ms ease-in" };
//   const unmountedStyle = {
//     animation: "outAnimation 270ms ease-out",
//     animationFillMode: "forwards",
//   };

//   socket.addEventListener("open", (event) => {
//     socket.send("Connection established");
//   });
//   let newDataPoint;
//   useEffect(() => {
//     console.log("working");

//     socket.addEventListener("message", (event) => {
//       console.log(event.data);
//       if (event.data === "end") {
//         setDataStream("end");
//         setIsMounted(!isMounted);
//         setShowDiv(!showDiv);
//         return;
//       }
//       const data = JSON.parse(event.data);

//       // console.log(data);
//       if (!data) {
//         console.error(data.error);
//       } else {
//         newDataPoint = {
//           time: parseInt(data.time, 10),
//           steps: parseInt(data.steps, 10),
//         };

//         // setDataStream([{ x: newDataPoint.time, y: newDataPoint.steps }]);
//         setDataStream((prevDataStream) => {
//           const updatedDataStream = [...prevDataStream, newDataPoint];
//           // if (updatedDataStream.length > 101) {
//           //   updatedDataStream.shift();
//           // }
//           return updatedDataStream;
//         });
//       }
//     });
//   }, []);
//   // console.log(dataStream);

//   return (
//     <div className="app">
//       <header className="header">Walking Steps Chart</header>
//       <div className="graph-display-container">
//         <div className="column left">
//           <div className="inside-column-left">
//             <div className="title-text">
//               Mihos<span>.</span>
//             </div>
//           </div>
//         </div>
//         <div className="graph-display">
//           {/* <div className="block top"></div>
//           <div className="block mid"></div>
//           <div className="block bottom"></div> */}
//           {showDiv && (
//             <div
//               className="final-result"
//               style={showDiv ? mountedStyle : unmountedStyle}
//               onClick={() => {
//                 console.log(isMounted);
//                 setIsMounted(false);
//               }}
//               onAnimationEnd={() => {
//                 if (!isMounted) {
//                   console.log("klajsdhf");
//                   setShowDiv(false);
//                 }
//               }}
//             >
//               <header>time in green zone</header>
//               <p>38%</p>
//             </div>
//           )}
//           <div className="chart">
//             <ChartViewer data={dataStream} />
//           </div>
//           <ChartDetail data={dataStream} />
//         </div>
//         <div className="column right">
//           <div className="inside-column-right">
//             <div className="right-column-content">
//               <header className="right-column-header"> Biblography</header>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
