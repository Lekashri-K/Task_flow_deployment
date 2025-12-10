// import React from 'react';
// import { BsListTask, BsPeople, BsShield, BsPersonCheck, BsArrowRight, BsCheckCircle } from 'react-icons/bs';
// import { Container, Row, Col, Card, Button, Navbar } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';

// const HomePage = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="home-page" style={{ 
//       minHeight: '100vh', 
//       backgroundColor: '#f8fafc',
//       fontFamily: "'Inter', -apple-system, sans-serif",
//       overflowX: 'hidden'
//     }}>
//       {/* Modern Navigation Bar */}
//       <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
//         <Container>
//           <Navbar.Brand className="fw-bold" style={{ 
//             fontSize: '1.5rem',
//             color: '#3b82f6',
//             display: 'flex',
//             alignItems: 'center'
//           }}>
//             <div style={{
//               width: '40px',
//               height: '40px',
//               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
//               borderRadius: '10px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               marginRight: '12px',
//               color: 'white',
//               boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
//             }}>
//               <BsListTask size={20} />
//             </div>
//             TaskFlow
//           </Navbar.Brand>

//           <Button 
//             variant="primary"
//             onClick={() => navigate('/login')}
//             style={{ 
//               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
//               border: 'none',
//               fontWeight: '500',
//               borderRadius: '8px',
//               padding: '8px 20px',
//               boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
//               width:'100px'
//             }}
//           >
//             Login
//           </Button>
//         </Container>
//       </Navbar>

//       {/* Hero Section with Gradient */}
//       <section className="py-5" style={{ 
//         background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
//         color: 'white',
//         padding: '100px 0',
//         position: 'relative',
//         overflow: 'hidden'
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: '-100px',
//           right: '-100px',
//           width: '400px',
//           height: '400px',
//           borderRadius: '50%',
//           background: 'rgba(255,255,255,0.1)'
//         }}></div>

//         <Container className="text-center position-relative" style={{ zIndex: 1 }}>
//           <h1 className="display-5 fw-bold mb-4" style={{ 
//             fontWeight: 700,
//             lineHeight: 1.3,
//             maxWidth: '800px',
//             margin: '0 auto'
//           }}>
//             Streamline Your Team's Workflow with <span style={{ color: '#fef08a' }}>TaskFlow</span>
//           </h1>
//           <p className="lead mb-4" style={{ 
//             fontSize: '1.2rem',
//             maxWidth: '600px',
//             margin: '0 auto',
//             opacity: 0.9
//           }}>
//             Simple, role-based task management for Super Managers, Managers, and Team Members.
//           </p>
//           <Button 
//             variant="light" 
//             className="px-4 py-2 fw-medium d-flex align-items-center mx-auto"
//             style={{ 
//               borderRadius: '8px',
//               minWidth: '160px',
//               boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//               height:'45px',
//               width:'180px'
//             }}
//             onClick={() => navigate('/login')}
//           >
//             Get Started <BsArrowRight className="ms-2" />
//           </Button>
//         </Container>
//       </section>

//       {/* Role Features Section */}
//       <section className="py-5 my-5">
//         <Container>
//           <h2 className="text-center mb-5" style={{ 
//             color: '#1e3a8a',
//             fontWeight: 600,
//             position: 'relative',
//             display: 'inline-block',
//             margin: '0 auto',
//             paddingBottom: '10px'
//           }}>
//             <span style={{
//               position: 'absolute',
//               bottom: 0,
//               left: '50%',
//               transform: 'translateX(-50%)',
//               width: '60px',
//               height: '4px',
//               background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
//               borderRadius: '2px'
//             }}></span>
//             Role-Based Access Control
//           </h2>

//           <Row className="g-4">
//             <Col md={4}>
//               <Card className="h-100 border-0 shadow-sm hover-effect" style={{ 
//                 borderRadius: '12px',
//                 transition: 'transform 0.3s ease, box-shadow 0.3s ease'
//               }}>
//                 <Card.Body className="p-4 text-center">
//                   <div style={{
//                     width: '70px',
//                     height: '70px',
//                     background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
//                     borderRadius: '18px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     color: '#3b82f6',
//                     boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
//                   }}>
//                     <BsShield size={28} />
//                   </div>
//                   <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Super Manager</h4>
//                   <p className="text-muted mb-4">
//                     Full system control with permissions to manage all teams, projects, and user roles.
//                   </p>
//                   <Button 
//                     variant="outline-primary" 
//                     size="sm"
//                     onClick={() => navigate('/login')}
//                     style={{
//                       borderRadius: '6px',
//                       padding: '6px 12px',
//                       fontSize: '0.9rem',
//                       color:'white'                    }}
//                   >
//                     Access Dashboard
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>

//             <Col md={4}>
//               <Card className="h-100 border-0 shadow-sm hover-effect" style={{ 
//                 borderRadius: '12px',
//                 transition: 'transform 0.3s ease, box-shadow 0.3s ease'
//               }}>
//                 <Card.Body className="p-4 text-center">
//                   <div style={{
//                     width: '70px',
//                     height: '70px',
//                     background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
//                     borderRadius: '18px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     color: '#3b82f6',
//                     boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
//                   }}>
//                     <BsPeople size={28} />
//                   </div>
//                   <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Manager</h4>
//                   <p className="text-muted mb-4">
//                     Manage assigned teams with task creation, assignment, and progress tracking.
//                   </p>
//                   <Button 
//                     variant="outline-primary" 
//                     size="sm"
//                     onClick={() => navigate('/login')}
//                     style={{
//                       borderRadius: '6px',
//                       padding: '6px 12px',
//                       fontSize: '0.9rem',
//                        color:'white'   
//                     }}
//                   >
//                     Access Dashboard
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>

//             <Col md={4}>
//               <Card className="h-100 border-0 shadow-sm hover-effect" style={{ 
//                 borderRadius: '12px',
//                 transition: 'transform 0.3s ease, box-shadow 0.3s ease'
//               }}>
//                 <Card.Body className="p-4 text-center">
//                   <div style={{
//                     width: '70px',
//                     height: '70px',
//                     background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
//                     borderRadius: '18px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     color: '#3b82f6',
//                     boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
//                   }}>
//                     <BsPersonCheck size={28} />
//                   </div>
//                   <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Team Member</h4>
//                   <p className="text-muted mb-4">
//                     View and update assigned tasks with clear visibility of priorities and deadlines.
//                   </p>
//                   <Button 
//                     variant="outline-primary" 
//                     size="sm"
//                     onClick={() => navigate('/login')}
//                     style={{
//                       borderRadius: '6px',
//                       padding: '6px 12px',
//                       fontSize: '0.9rem',
//                         color:'white'   
//                     }}
//                   >
//                     Access Dashboard
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Key Features Section */}
//       <section className="py-5" style={{ backgroundColor: '#f0f9ff' }}>
//         <Container>
//           <Row className="align-items-center">
//             <Col md={6} className="mb-4 mb-md-0">
//               <h2 className="mb-4" style={{ 
//                 color: '#1e3a8a',
//                 fontWeight: 600,
//                 position: 'relative',
//                 paddingBottom: '10px'
//               }}>
//                 <span style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   width: '60px',
//                   height: '4px',
//                   background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
//                   borderRadius: '2px'
//                 }}></span>
//                 Why Choose TaskFlow?
//               </h2>

//               <div className="mb-4">
//                 <div className="d-flex align-items-start mb-3">
//                   <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.5rem', flexShrink: 0 }} />
//                   <div>
//                     <h5 style={{ color: '#1e3a8a' }}>Simple Interface</h5>
//                     <p className="text-muted">Intuitive design that gets you up and running in minutes</p>
//                   </div>
//                 </div>

//                 <div className="d-flex align-items-start mb-3">
//                   <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.5rem', flexShrink: 0 }} />
//                   <div>
//                     <h5 style={{ color: '#1e3a8a' }}>Role-Based Access</h5>
//                     <p className="text-muted">Clear permissions structure for different team members</p>
//                   </div>
//                 </div>

//                 <div className="d-flex align-items-start mb-3">
//                   <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.5rem', flexShrink: 0 }} />
//                   <div>
//                     <h5 style={{ color: '#1e3a8a' }}>Task Tracking</h5>
//                     <p className="text-muted">Easily monitor task progress and completion</p>
//                   </div>
//                 </div>

//                 <div className="d-flex align-items-start">
//                   <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.5rem', flexShrink: 0 }} />
//                   <div>
//                     <h5 style={{ color: '#1e3a8a' }}>Free Forever</h5>
//                     <p className="text-muted">No hidden costs or premium features</p>
//                   </div>
//                 </div>
//               </div>
//             </Col>

//             <Col md={6}>
//               <div style={{
//                 borderRadius: '12px',
//                 overflow: 'hidden',
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center'
//               }}>
//                 <div style={{
//                   backgroundColor: 'white',
//                   borderRadius: '12px',
//                   padding: '30px',
//                   boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
//                   border: '1px solid #e2e8f0'
//                 }}>
//                   <h4 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Getting Started is Easy</h4>

//                   <div className="d-flex align-items-start mb-3">
//                     <div style={{
//                       width: '30px',
//                       height: '30px',
//                       backgroundColor: '#3b82f6',
//                       color: 'white',
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       marginRight: '15px',
//                       flexShrink: 0,
//                       fontWeight: '600'
//                     }}>1</div>
//                     <div>
//                       <h5 style={{ color: '#1e3a8a' }}>Login with your credentials</h5>
//                       <p className="text-muted">Your manager will provide your login details</p>
//                     </div>
//                   </div>

//                   <div className="d-flex align-items-start mb-3">
//                     <div style={{
//                       width: '30px',
//                       height: '30px',
//                       backgroundColor: '#3b82f6',
//                       color: 'white',
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       marginRight: '15px',
//                       flexShrink: 0,
//                       fontWeight: '600'
//                     }}>2</div>
//                     <div>
//                       <h5 style={{ color: '#1e3a8a' }}>Access your dashboard</h5>
//                       <p className="text-muted">See all tasks assigned to you or your team</p>
//                     </div>
//                   </div>

//                   <div className="d-flex align-items-start">
//                     <div style={{
//                       width: '30px',
//                       height: '30px',
//                       backgroundColor: '#3b82f6',
//                       color: 'white',
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       marginRight: '15px',
//                       flexShrink: 0,
//                       fontWeight: '600'
//                     }}>3</div>
//                     <div>
//                       <h5 style={{ color: '#1e3a8a' }}>Start managing tasks</h5>
//                       <p className="text-muted">Update status, add comments, or complete tasks</p>
//                     </div>
//                   </div>

//                   <Button 
//                     variant="primary" 
//                     className="mt-4 w-100"
//                     onClick={() => navigate('/login')}
//                     style={{ 
//                       background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
//                       border: 'none',
//                       borderRadius: '8px',
//                       padding: '10px',
//                       fontWeight: '500'
//                     }}
//                   >
//                     Login Now
//                   </Button>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Final CTA Section */}


//       {/* Simple Footer */}
//       <footer className="py-4" style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
//         <Container>
//           <div className="text-center">
//             <p className="mb-0" style={{ opacity: 0.8 }}>
//               © {new Date().getFullYear()} TaskFlow. All rights reserved.
//             </p>
//           </div>
//         </Container>
//       </footer>

//       <style>{`
//         .hover-effect:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2) !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default HomePage;
import React from 'react';
import { BsListTask, BsPeople, BsShield, BsPersonCheck, BsArrowRight, BsCheckCircle } from 'react-icons/bs';
import { Container, Row, Col, Card, Button, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page" style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: 'hidden'
    }}>
      {/* Modern Navigation Bar */}
      <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
        <Container>
          <Navbar.Brand className="fw-bold" style={{
            fontSize: '1.5rem',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}>
              <BsListTask size={20} />
            </div>
            TaskFlow
          </Navbar.Brand>

          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              fontWeight: '500',
              borderRadius: '8px',
              padding: '8px 20px',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
              width: '100px'
            }}
          >
            Login
          </Button>
        </Container>
      </Navbar>

      {/* Hero Section with Gradient */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '80px 0 60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }}></div>

        <Container className="text-center position-relative" style={{ zIndex: 1 }}>
          <h1 className="display-5 fw-bold mb-4" style={{
            fontWeight: 700,
            lineHeight: 1.3,
            maxWidth: '800px',
            margin: '0 auto 30px auto'
          }}>
            Streamline Your Team's Workflow with <span style={{ color: '#fef08a' }}>TaskFlow</span>
          </h1>
          <p
  className="lead mb-4"
  style={{
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto 30px auto',
    opacity: 0.9,
   
  }}
>
  Note: Use the demo credentials provided below to log in and explore the system features.
</p>
        

          <Button
            variant="light"
            className="px-4 py-2 fw-medium d-flex align-items-center mx-auto"
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              height: '45px',
              width: '175px'
            }}
            onClick={() => navigate('/login')}
          >
            Get Started <BsArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>

      {/* Role Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5" style={{
            color: '#1e3a8a',
            fontWeight: 600,
            position: 'relative',
            display: 'inline-block',
            margin: '0 auto',
            paddingBottom: '10px'
          }}>
            <span style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '2px'
            }}></span>
            Role-Based Access Control
          </h2>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-effect" style={{
                borderRadius: '12px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <Card.Body className="p-4 text-center d-flex flex-column">
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#3b82f6',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                  }}>
                    <BsShield size={28} />
                  </div>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Super Manager</h4>
                  <p className="text-muted mb-3 flex-grow-1">
                    Full system control with permissions to create and manage all projects, and user roles.
                  </p>

                  {/* Demo Credentials */}
                  <div className="mb-3 p-2" style={{
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div className="text-center" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                      <div><strong>Demo Access</strong></div>
                      <div>User: supermanager</div>
                      <div>Pass: supermanager@123</div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/login')}
                    style={{
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      backgroundColor: '#3b82f6',
                      border: 'none'
                    }}
                  >
                    Access Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-effect" style={{
                borderRadius: '12px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <Card.Body className="p-4 text-center d-flex flex-column">
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#3b82f6',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                  }}>
                    <BsPeople size={28} />
                  </div>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Manager</h4>
                  <p className="text-muted mb-3 flex-grow-1">
                    Manage assigned teams with task creation, assignment, and progress tracking.
                  </p>

                  {/* Demo Credentials */}
                  <div className="mb-3 p-2" style={{
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div className="text-center" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                      <div><strong>Demo Access</strong></div>
                      <div>User: manager</div>
                      <div>Pass: manager@123</div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/login')}
                    style={{
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      backgroundColor: '#3b82f6',
                      border: 'none'
                    }}
                  >
                    Access Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-effect" style={{
                borderRadius: '12px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <Card.Body className="p-4 text-center d-flex flex-column">
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#3b82f6',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                  }}>
                    <BsPersonCheck size={28} />
                  </div>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Team Member</h4>
                  <p className="text-muted mb-3 flex-grow-1">
                  View and update all your assigned tasks with clear visibility of deadlines, and progress status.
                  </p>

                  {/* Demo Credentials */}
                  <div className="mb-3 p-2" style={{
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div className="text-center" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                      <div><strong>Demo Access</strong></div>
                      <div>User: employee</div>
                      <div>Pass: employee@123</div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/login')}
                    style={{
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      backgroundColor: '#3b82f6',
                      border: 'none'
                    }}
                  >
                    Access Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Key Features Section */}
      <section className="py-5" style={{ backgroundColor: '#f0f9ff' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="mb-4" style={{
                color: '#1e3a8a',
                fontWeight: 600,
                position: 'relative',
                paddingBottom: '10px'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '2px'
                }}></span>
                Why Choose TaskFlow?
              </h2>

              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>Simple Interface</h5>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Intuitive design that gets you up and running in minutes</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>Role-Based Access</h5>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Clear permissions structure for different team members</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>Task Tracking</h5>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Easily monitor task progress and completion</p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <BsCheckCircle className="me-3" style={{ color: '#3b82f6', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>Free Forever</h5>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>No hidden costs or premium features</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                height: '100%'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '20px', fontSize: '1.3rem' }}>Getting Started is Easy</h4>

                  <div className="d-flex align-items-start mb-3">
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>1</div>
                    <div>
                      <h5 style={{ color: '#1e3a8a', fontSize: '1rem' }}>Login with demo credentials</h5>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>

                        Use the password mentioned in the demo credentials
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start mb-3">
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>2</div>
                    <div>
                      <h5 style={{ color: '#1e3a8a', fontSize: '1rem' }}>Access your dashboard</h5>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>See all tasks assigned to you or your team</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>3</div>
                    <div>
                      <h5 style={{ color: '#1e3a8a', fontSize: '1rem' }}>Start managing your team's tasks</h5>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Track progress, assign work, and mark tasks as complete
                      </p>
                    </div>

                  </div>

                  <Button
                    variant="primary"
                    className="mt-4 w-100"
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  >
                    Login Now
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Simple Footer */}
      <footer className="py-4" style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
        <Container>
          <div className="text-center">
            <p className="mb-0" style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>

      <style>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default HomePage;