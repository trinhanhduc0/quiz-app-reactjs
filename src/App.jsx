// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "~/layouts/Layout";
import Dashboard from "~/pages/Dashboard/Dashboard";
import Logout from "~/components/Login/Logout";
import Login from "~/components/Login/Login";
import ListTest from "~/pages/ListTest/ListTest";
import DoTest from "~/pages/DoTest/DoTest";
import ManageClass from "~/pages/ManageClass/ManageClass";
import ManageTest from "~/pages/ManageTest/ManageTest";
import ManageQuestion from "~/pages/ManageQuestion/ManageQuestion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/list-test/:classId/:author" element={<ListTest />} />
          <Route path="/do-test/:isTest/:author/:testId" element={<DoTest />} />
          <Route path="/manage-class" element={<ManageClass />} />
          <Route path="/manage-test" element={<ManageTest />} />
          <Route path="/manage-question" element={<ManageQuestion />} />
          {/* <Route path="/joinclass" element={<JoinClass />} /> */}
          {/* Thêm route cho DoTest */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
