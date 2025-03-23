// src/components/ClassSelection.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, where, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion } from 'framer-motion';

const ClassSelection = () => {
  const location = useLocation();
  const { userData } = location.state || {};
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassesAndSubjects = async () => {
      try {
        // ✅ Fetch classes assigned to the teacher
        const classCollection = collection(db, 'class');
        const classQuery = query(classCollection, where('teacherEmail', '==', userData.email));
        const classSnapshot = await getDocs(classQuery);

        if (!classSnapshot.empty) {
          const classList = classSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setClasses(classList);

          // ✅ Fetch subjects for each class
          const subjectsData = {};
          for (const classItem of classList) {
            const subjectCollection = collection(db, 'subject');
            const subjectQuery = query(subjectCollection, where('class', '==', classItem.classId));
            const subjectSnapshot = await getDocs(subjectQuery);

            subjectsData[classItem.classId] = subjectSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          }
          setSubjects(subjectsData);
        } else {
          console.log('No classes found for this teacher.');
        }
      } catch (error) {
        console.error('Error fetching classes and subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndSubjects();
  }, [userData.email]);

  const handleSelectClassAndSubject = (classItem, subjectItem) => {
    navigate('/attendance-marking', { state: { classItem, subjectItem } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #4F46E5, #9333EA)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1F2937',
          }}
        >
          Welcome, {userData?.name}
        </h2>

        <h3
          style={{
            fontSize: '1.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#4B5563',
          }}
        >
          Select a Class and Subject
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#6B7280' }}>Loading...</p>
        ) : (
          <div>
            {classes.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#EF4444' }}>
                No classes found.
              </p>
            ) : (
              classes.map((classItem) => (
                <div
                  key={classItem.id}
                  style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #6366F1',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      color: '#374151',
                    }}
                  >
                    Class: {classItem.classId}
                  </h4>

                  {subjects[classItem.classId]?.length > 0 ? (
                    subjects[classItem.classId].map((subjectItem) => (
                      <motion.button
                        key={subjectItem.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectClassAndSubject(classItem, subjectItem)}
                        style={{
                          marginRight: '1rem',
                          marginBottom: '1rem',
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#4F46E5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        {subjectItem.name}
                      </motion.button>
                    ))
                  ) : (
                    <p style={{ color: '#EF4444' }}>No subjects available for this class.</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassSelection;
