import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection ,where,query} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const ClassSelection = () => {
  const location = useLocation();
  const { userData } = location.state || {};
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classCollection = collection(db, 'class');
        const q = query(classCollection, where("teacherEmail", "==", userData.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty){
            console.log('Classes found:', snapshot.docs.length);
            const classList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setClasses(classList);
        }
        else{
            console.log('No classes found');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [userData.email]);

  const handleSelectClass = (classItem) => {
    console.log('Class selected:', classItem);
    navigate('/attendance-marking', { state: { classItem } });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Welcome, {userData?.name}</h2>
      <h3 className="text-xl mb-4">Select a Class:</h3>
      <ul>
        {classes.map((classItem) => (
          <li key={classItem.id} className="mb-2 p-2 border rounded-lg">
            {classItem.classId}
            <button style={{marginLeft:30}} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2" onClick={() => handleSelectClass(classItem)}>Select Class</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassSelection;
