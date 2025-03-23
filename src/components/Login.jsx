// src/components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion } from 'framer-motion';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    padding: '20px',
  },
  formWrapper: {
    maxWidth: '600px',
    width: '100%',
    background: '#ffffff',
    padding: '50px 40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  header: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#2d3748',
    marginBottom: '20px',
    letterSpacing: '2px',
  },
  logo: {
    width: '150px',
    height: '150px',
    objectFit: 'contain',
    marginBottom: '30px',
  },
  inputContainer: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e0',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontSize: '16px',
  },
  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e0',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    color: '#fff',
    background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  error: {
    color: '#e53e3e',
    fontWeight: '600',
    marginBottom: '20px',
  },
  footer: {
    marginTop: '30px',
    color: '#718096',
    fontSize: '14px',
  },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!email || !password) {
        setError('⚠️ Email and password are required!');
        return;
      }

      if (role === 'admin' && email === 'admin@gmail.com' && password === '123') {
        navigate('/admin-reports');
        return;
      }

      const collectionName = role === 'student' ? 'student' : 'teacher';
      const userRef = collection(db, collectionName);
      const q = query(userRef, where('email', '==', email), where('password', '==', password));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        navigate(role === 'student' ? '/student-dashboard' : '/class-selection', {
          state: { userData },
        });
      } else {
        setError(`❌ ${role.charAt(0).toUpperCase() + role.slice(1)} not found.`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('❌ Login failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={styles.container}
    >
      <div style={styles.formWrapper}>
        <h1 style={styles.header}>SMART PRESENCE</h1>
        <img src="/logomain.PNG" alt="Logo" style={styles.logo} />

        {error && <motion.p style={styles.error}>{error}</motion.p>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="student">🎓 Student</option>
              <option value="teacher">👨‍🏫 Teacher</option>
              <option value="admin">🛠️ Admin</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={styles.button}
          >
            Login
          </motion.button>
        </form>

        <p style={styles.footer}>© {new Date().getFullYear()} Attendance System. All rights reserved.</p>
      </div>
    </motion.div>
  );
};

export default Login;
