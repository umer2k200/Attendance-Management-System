import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, where, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';

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
        // Fetch classes assigned to the teacher
        const classCollection = collection(db, 'class');
        const classQuery = query(classCollection, where("teacherEmail", "==", userData.email));
        const classSnapshot = await getDocs(classQuery);

        if (!classSnapshot.empty) {
          const classList = classSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setClasses(classList);

          // Fetch subjects for each class
          const subjectsData = {};
          for (const classItem of classList) {
            const subjectCollection = collection(db, 'subject');
            const subjectQuery = query(subjectCollection, where("class", "==", classItem.classId));
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
    console.log('Class and Subject selected:', classItem, subjectItem);
    navigate('/attendance-marking', { state: { classItem, subjectItem } });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Welcome, {userData?.name}</h2>
      <h3 className="text-xl mb-4">Select a Class and Subject:</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {classes.map((classItem) => (
            <li key={classItem.id} className="mb-6 p-4 border rounded-lg">
              <h4 className="text-lg font-semibold">Class: {classItem.classId}</h4>

              {subjects[classItem.classId]?.length > 0 ? (
                subjects[classItem.classId].map((subjectItem) => (
                  <button
                    key={subjectItem}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 mr-4"
                    onClick={() => handleSelectClassAndSubject(classItem, subjectItem)}
                  >
                    {subjectItem.name}
                  </button>
                ))
              ) : (
                <p>No subjects found for this class.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassSelection;
