import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('S');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if(!email || !password){
        setError('Email and password required');
        return;
      }
      if (role === 'admin') {
        if(email === 'admin@gmail.com' && password === '123'){
          navigate('/admin-reports');
        }
      }
      if (role === 'student') {
        // Fetch user from Firestore based on email
        const studentRef = collection(db,'student');
        const q = query(studentRef, where("email","==",email), where("password","==", password));
        const snapshot1 = await getDocs(q);
        if(!snapshot1.empty){
          const userData = snapshot1.docs[0].data();
          console.log('User Data found: ', userData);
          setError('Student found');
          navigate('/student-dashboard',
          {state: {userData: userData}}
          );
        }
        else{
          setError('User data not found');
        }
      }
      if (role === 'teacher') {
        // Fetch user from Firestore based on email
        const teacherRef = collection(db,'teacher');
        const q = query(teacherRef, where("email","==",email), where("password","==", password));
        const snapshot2 = await getDocs(q);
        if(!snapshot2.empty){
          const userData = snapshot2.docs[0].data();
          console.log('teacher found: ', userData);
          setError('User Data found');
          navigate('/class-selection',
          {state: {userData: userData}}
          );
        }
        else{
          setError('User data not found');
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
       <h1 >Student Attendance Management System</h1>
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div> 
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg">Login</button>
      </form>
    </div>
  );
};

export default Login;