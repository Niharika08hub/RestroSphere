// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import ViewItems from "./pages/ViewItems";
import ReportItem from "./pages/ReportItem";
import ItemDetail from "./pages/ItemDetail";

import "./App.css";

function App() {
  return (
    <div className="App theme-transition">
      <Header />

      <main className="main-content theme-transition">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/report" element={<ReportItem />} />

          {/* NEW ROUTE FOR EDIT */}
          <Route path="/edit/:id" element={<ReportItem />} />

          <Route path="/view-items" element={<ViewItems />} />

          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;