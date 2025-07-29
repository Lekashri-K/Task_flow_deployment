// import React, { useEffect, useRef, useState } from 'react';
// import { Chart, registerables } from 'chart.js';
// import { Link } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import { useAuth } from '../context/AuthContext';
// import api from '../api/api';
// import '../styles/Reports.css';

// Chart.register(...registerables);

// const Reports = () => {
//   const { user, logout } = useAuth();
//   const statusChartRef = useRef(null);

//   const [loading, setLoading] = useState(true);
//   const [hasData, setHasData] = useState(false);
//   const [selectedProject, setSelectedProject] = useState('');
//   const [reportData, setReportData] = useState({
//     stats: {
//       total_tasks: 0,
//       completed_tasks: 0,
//       overdue_tasks: 0,
//       pending_tasks: 0,
//       in_progress_tasks: 0
//     },
//     statusDistribution: { labels: [], data: [] },
//     projectsProgress: [],
//     allProjects: [],
//   });

//   const handleLogout = () => {
//     logout();
//   };

//   useEffect(() => {
//     fetchReportData();
//   }, [selectedProject]);

//   const fetchReportData = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('reports/', {
//         params: {
//           project: selectedProject || undefined
//         }
//       });

//       const data = response.data;

//       setReportData({
//         stats: data.stats || {
//           total_tasks: 0,
//           completed_tasks: 0,
//           overdue_tasks: 0,
//           pending_tasks: 0,
//           in_progress_tasks: 0
//         },
//         statusDistribution: data.statusDistribution || { labels: [], data: [] },
//         projectsProgress: data.projectsProgress || [],
//         allProjects: data.allProjects || [],
//       });

//       setHasData(
//         (data.statusDistribution?.labels?.length > 0) ||
//         (data.projectsProgress?.length > 0) ||
//         (data.stats?.total_tasks > 0)
//       );
//     } catch (error) {
//       console.error('Error fetching report data:', error);
//       setHasData(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!hasData) return;

//     const statusCtx = statusChartRef.current?.getContext('2d');

//     if (statusChartRef.current?.chart) {
//       statusChartRef.current.chart.destroy();
//     }

//     if (statusCtx && reportData.statusDistribution.labels.length > 0) {
//       statusChartRef.current.chart = new Chart(statusCtx, {
//         type: 'doughnut',
//         data: {
//           labels: reportData.statusDistribution.labels,
//           datasets: [{
//             data: reportData.statusDistribution.data,
//             backgroundColor: ['#FF6384', '#36A2EB', '#81C784'],


//             borderWidth: 0
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: 'right',
//               labels: {
//                 padding: 20,
//                 usePointStyle: true,
//                 pointStyle: 'circle'
//               }
//             },
//             tooltip: {
//               callbacks: {
//                 label: function (context) {
//                   const label = context.label || '';
//                   const value = context.raw || 0;
//                   const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                   const percentage = Math.round((value / total) * 100);
//                   return `${label}: ${value} (${percentage}%)`;
//                 }
//               }
//             }
//           },
//           cutout: '60%'
//         }
//       });
//     }

//     return () => {
//       if (statusChartRef.current?.chart) {
//         statusChartRef.current.chart.destroy();
//       }
//     };
//   }, [hasData, reportData]);

//   if (loading) {
//     return (
//       <div className="d-flex">
//         <Sidebar />
//         <div className="main-content" style={{ padding: '20px' }}>
//           <div className="text-center py-5">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <p>Loading reports...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="d-flex">
//       <Sidebar />
//       <div className="main-content" style={{ padding: '20px' }}>
//         <div className="header d-flex justify-content-between align-items-center mb-4">
//           <h4 className="mb-0">Reports Overview</h4>
//           <div className="dropdown">
//             <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle"
//               id="userDropdown" data-bs-toggle="dropdown">
//               <i className="bi bi-person-circle user-avatar me-2 fs-2"></i>
//               <span className="d-none d-md-inline">{user.full_name || 'Super Manager'}</span>
//             </a>
//             <ul className="dropdown-menu dropdown-menu-end">
//               <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
//               <li><Link className="dropdown-item" to="/settings"><i className="bi bi-gear me-2"></i>Settings</Link></li>
//               <li><hr className="dropdown-divider" /></li>
//               <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
//             </ul>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="card mb-4 p-3">
//           <div className="row g-3 align-items-center">
//             <div className="col-md-8">
//               <label htmlFor="project" className="form-label">Project</label>
//               <select
//                 className="form-select"
//                 id="project"
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value || '')}
//                 disabled={loading}
//               >
//                 <option value="">All Projects</option>
//                 {reportData.allProjects.map(project => (
//                   <option key={project.id} value={project.id}>
//                     {project.name || `Project ${project.id}`}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="col-md-4 d-flex align-items-end justify-content-end">
//               <button
//                 className="btn btn-outline-secondary"
//                 onClick={fetchReportData}
//                 style={{ marginTop: '33px' }}
//               >
//                 <i className="bi bi-arrow-clockwise me-2"></i> Refresh Data
//               </button>
//             </div>
//           </div>
//         </div>

//         {!hasData ? (
//           <div className="alert alert-info mt-4">
//             <i className="bi bi-info-circle me-2"></i>
//             No report data available for the selected {selectedProject ? 'project' : 'filters'}.
//             {reportData.allProjects.length === 0 && (
//               <div className="mt-2">There are no projects in the system yet.</div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Stats Cards */}
//             <div className="row mb-4 g-3">
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">Total Tasks</h6>
//                     <h3 className="card-title">{reportData.stats.total_tasks || 0}</h3>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">Pending</h6>
//                     <h3 className="card-title text-warning">{reportData.stats.pending_tasks || 0}</h3>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">In Progress</h6>
//                     <h3 className="card-title text-primary">{reportData.stats.in_progress_tasks || 0}</h3>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">Completed</h6>
//                     <h3 className="card-title text-success">{reportData.stats.completed_tasks || 0}</h3>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">Overdue</h6>
//                     <h3 className="card-title text-danger">{reportData.stats.overdue_tasks || 0}</h3>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-2">
//                 <div className="card stat-card h-100">
//                   <div className="card-body">
//                     <h6 className="card-subtitle mb-2 text-muted">Completion</h6>
//                     <h3 className="card-title">
//                       {reportData.stats.total_tasks > 0 ?
//                         `${Math.round((reportData.stats.completed_tasks / reportData.stats.total_tasks) * 100)}%` :
//                         '0%'}
//                     </h3>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Project Progress and Status Chart Side-by-Side */}
//             <div className="row g-4">
//               {/* Project Progress Table - Left Side */}
//               <div className="col-md-8">
//                 <div className="card h-100">
//                   <div className="card-header">
//                     <h5 className="mb-0">Project Progress</h5>
//                     <small className="text-muted">
//                       {selectedProject ? 'Showing selected project' : 'Showing all projects'}
//                     </small>
//                   </div>
//                   <div className="card-body">
//                     <div className="table-responsive">
//                       <table className="table table-hover">
//                         <thead>
//                           <tr>
//                             <th>Project</th>
//                             <th>Progress</th>
//                             <th>Tasks</th>
//                             <th>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {reportData.projectsProgress.map(project => (
//                             <tr key={project.id}>
//                               <td>{project.name}</td>
//                               <td>
//                                 <div className="d-flex align-items-center">
//                                   <div className="progress flex-grow-1" style={{ height: '6px' }}>
//                                     <div
//                                       className={`progress-bar ${project.progress >= 70 ? 'bg-success' : project.progress >= 40 ? 'bg-warning' : 'bg-danger'}`}
//                                       style={{ width: `${project.progress}%` }}
//                                     ></div>
//                                   </div>
//                                   <small className="ms-2">{Math.round(project.progress)}%</small>
//                                 </div>
//                               </td>
//                               <td>
//                                 <span className="text-success">{project.completed_tasks}</span>
//                                 <span className="text-muted">/</span>
//                                 <span>{project.total_tasks}</span>
//                               </td>
//                               <td>
//                                 <span className={`badge ${project.progress >= 70 ? 'bg-success-light text-success' : project.progress >= 40 ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger'}`}>
//                                   {project.progress >= 70 ? 'On Track' : project.progress >= 40 ? 'Behind' : 'Critical'}
//                                 </span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Doughnut Chart - Right Side */}
//               <div className="col-md-4">
//                 <div className="card h-100">
//                   <div className="card-header">
//                     <h5 className="mb-0">Task Status Distribution</h5>
//                     {selectedProject && (
//                       <small className="text-muted">For selected project</small>
//                     )}
//                   </div>
//                   <div className="card-body">
//                     <div className="chart-container" style={{ height: '300px' }}>
//                       <canvas ref={statusChartRef}></canvas>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Reports;
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import '../styles/Reports.css';

Chart.register(...registerables);

const Reports = () => {
  const { user, logout } = useAuth();
  const statusChartRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [reportData, setReportData] = useState({
    stats: {
      total_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0
    },
    statusDistribution: { labels: [], data: [] },
    projectsProgress: [],
    allProjects: [],
  });

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedProject]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('reports/', {
        params: {
          project: selectedProject || undefined
        }
      });

      const data = response.data;

      // Verify and normalize the status counts
      const verifiedStats = {
        total_tasks: data.stats?.total_tasks || 0,
        completed_tasks: data.stats?.completed_tasks || 0,
        overdue_tasks: data.stats?.overdue_tasks || 0,
        pending_tasks: data.stats?.pending_tasks || 0,
        in_progress_tasks: data.stats?.in_progress_tasks || 0
      };

      // Create status distribution that matches the stats
      const verifiedStatusDistribution = {
        labels: ['Pending', 'In Progress', 'Completed', 'Overdue'],
        data: [
          verifiedStats.pending_tasks,
          verifiedStats.in_progress_tasks,
          verifiedStats.completed_tasks,
          verifiedStats.overdue_tasks
        ]
      };

      console.log("Status Verification:", {
        stats: verifiedStats,
        chartData: verifiedStatusDistribution
      });

      setReportData({
        stats: verifiedStats,
        statusDistribution: verifiedStatusDistribution,
        projectsProgress: data.projectsProgress || [],
        allProjects: data.allProjects || [],
      });

      setHasData(verifiedStats.total_tasks > 0);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasData) return;

    const statusCtx = statusChartRef.current?.getContext('2d');

    if (statusChartRef.current?.chart) {
      statusChartRef.current.chart.destroy();
    }

    if (statusCtx && reportData.statusDistribution.labels.length > 0) {
      statusChartRef.current.chart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: reportData.statusDistribution.labels,
          datasets: [{
            data: reportData.statusDistribution.data,
            backgroundColor: [
              '#FFCE56', // Pending - Yellow
              '#36A2EB', // In Progress - Blue
              '#81C784', // Completed - Green
              '#FF6384'  // Overdue - Red
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    }

    return () => {
      if (statusChartRef.current?.chart) {
        statusChartRef.current.chart.destroy();
      }
    };
  }, [hasData, reportData]);

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="main-content" style={{ padding: '20px' }}>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content" style={{ padding: '20px' }}>
        <div className="header d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Reports Overview</h4>
          <div className="dropdown">
            <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle me-1 fs-4"></i>
              <span className="d-none d-md-inline">{user.full_name || 'Super Manager'}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li className="dropdown-item disabled">
                <small className="text-muted">Signed in as Super Manager</small>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={handleLogout}
                  style={{ color: '#0d6efd', color: 'white' }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <label htmlFor="project" className="form-label">Project</label>
              <select
                className="form-select"
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value || '')}
                disabled={loading}
              >
                <option value="">All Projects</option>
                {reportData.allProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name || `Project ${project.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={fetchReportData}
                style={{ marginTop: '33px', color: 'white' }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Refresh Data
              </button>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="alert alert-info mt-4">
            <i className="bi bi-info-circle me-2"></i>
            No report data available for the selected {selectedProject ? 'project' : 'filters'}.
            {reportData.allProjects.length === 0 && (
              <div className="mt-2">There are no projects in the system yet.</div>
            )}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row mb-4 g-3">
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Total Tasks</h6>
                    <h3 className="card-title">{reportData.stats.total_tasks || 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Pending</h6>
                    <h3 className="card-title text-warning">{reportData.stats.pending_tasks || 0}</h3>
                    <small className="text-muted">
                      {reportData.stats.total_tasks > 0 ?
                        `${Math.round((reportData.stats.pending_tasks / reportData.stats.total_tasks) * 100)}%` :
                        '0%'}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">In Progress</h6>
                    <h3 className="card-title text-primary">{reportData.stats.in_progress_tasks || 0}</h3>
                    <small className="text-muted">
                      {reportData.stats.total_tasks > 0 ?
                        `${Math.round((reportData.stats.in_progress_tasks / reportData.stats.total_tasks) * 100)}%` :
                        '0%'}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Completed</h6>
                    <h3 className="card-title text-success">{reportData.stats.completed_tasks || 0}</h3>
                    <small className="text-muted">
                      {reportData.stats.total_tasks > 0 ?
                        `${Math.round((reportData.stats.completed_tasks / reportData.stats.total_tasks) * 100)}%` :
                        '0%'}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Overdue</h6>
                    <h3 className="card-title text-danger">{reportData.stats.overdue_tasks || 0}</h3>
                    <small className="text-muted">
                      {reportData.stats.total_tasks > 0 ?
                        `${Math.round((reportData.stats.overdue_tasks / reportData.stats.total_tasks) * 100)}%` :
                        '0%'}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Completion</h6>
                    <h3 className="card-title">
                      {reportData.stats.total_tasks > 0 ?
                        `${Math.round((reportData.stats.completed_tasks / reportData.stats.total_tasks) * 100)}%` :
                        '0%'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress and Status Chart Side-by-Side */}
            <div className="row g-4">
              {/* Project Progress Table - Left Side */}
              <div className="col-md-8">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="mb-0">Project Progress</h5>
                    <small className="text-muted">
                      {selectedProject ? 'Showing selected project' : 'Showing all projects'}
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Progress</th>
                            <th>Tasks</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.projectsProgress.map(project => (
                            <tr key={project.id}>
                              <td>{project.name}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div
                                      className={`progress-bar ${project.progress >= 70 ? 'bg-success' : project.progress >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${project.progress}%` }}
                                    ></div>
                                  </div>
                                  <small className="ms-2">{Math.round(project.progress)}%</small>
                                </div>
                              </td>
                              <td>
                                <span className="text-success">{project.completed_tasks}</span>
                                <span className="text-muted">/</span>
                                <span>{project.total_tasks}</span>
                              </td>
                              <td>
                                <span className={`badge ${project.progress >= 70 ? 'bg-success-light text-success' : project.progress >= 40 ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger'}`}>
                                  {project.progress >= 70 ? 'On Track' : project.progress >= 40 ? 'Behind' : 'Critical'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doughnut Chart - Right Side */}
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="mb-0">Task Status Distribution</h5>
                    {selectedProject && (
                      <small className="text-muted">For selected project</small>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ height: '300px' }}>
                      <canvas ref={statusChartRef}></canvas>
                    </div>
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Total: {reportData.stats.total_tasks} |
                        Pending: {reportData.stats.pending_tasks} |
                        In Progress: {reportData.stats.in_progress_tasks} |
                        Completed: {reportData.stats.completed_tasks} |
                        Overdue: {reportData.stats.overdue_tasks}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;