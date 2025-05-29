import { useState, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const DebugLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loginResult, setLoginResult] = useState(null);
  
  const { user } = useContext(AuthContext);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const handleLogin = async () => {
    setLoading(true);
    setLogs([]);
    setLoginResult(null);
    
    addLog('🔄 Starting login process...');
    
    try {
      addLog(`📤 Attempting login with username: ${username}`);
      
      // Make direct API call to test
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      addLog(`📥 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog('✅ Login successful!', 'success');
        addLog(`👤 User: ${data.user.username}`);
        addLog(`🎭 Role: ${data.user.role}`);
        addLog(`📧 Email: ${data.user.email}`);
        addLog(`🎫 Token: ${data.token.substring(0, 20)}...`);
        
        setLoginResult({
          success: true,
          data: data
        });
        
        // Test token storage
        localStorage.setItem('debug_token', data.token);
        addLog('💾 Token saved to localStorage');
        
      } else {
        const errorData = await response.json();
        addLog(`❌ Login failed: ${errorData.message}`, 'error');
        setLoginResult({
          success: false,
          error: errorData.message
        });
      }
      
    } catch (error) {
      addLog(`🚨 Network error: ${error.message}`, 'error');
      setLoginResult({
        success: false,
        error: error.message
      });
    }
    
    setLoading(false);
  };

  const testBackendConnection = async () => {
    addLog('🔌 Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        const data = await response.json();
        addLog('✅ Backend is reachable', 'success');
        addLog(`📄 Response: ${data.message}`);
      } else {
        addLog(`⚠️ Backend responded with status: ${response.status}`, 'warning');
      }
    } catch (error) {
      addLog(`❌ Cannot reach backend: ${error.message}`, 'error');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔍 Login Debug Tool
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Login
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Test Login'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={testBackendConnection}
            >
              Test Backend
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </Button>
          </Box>
        </Paper>

        {/* Current User State */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current User State
            </Typography>
            <Typography variant="body2">
              User: {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
            </Typography>
          </CardContent>
        </Card>

        {/* Login Result */}
        {loginResult && (
          <Alert 
            severity={loginResult.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
          >
            {loginResult.success ? (
              <div>
                <strong>Login Successful!</strong>
                <pre>{JSON.stringify(loginResult.data, null, 2)}</pre>
              </div>
            ) : (
              <div>
                <strong>Login Failed:</strong> {loginResult.error}
              </div>
            )}
          </Alert>
        )}

        {/* Logs */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Debug Logs
          </Typography>
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {logs.map((log, index) => (
              <Alert 
                key={index} 
                severity={log.type} 
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">
                  [{log.timestamp}] {log.message}
                </Typography>
              </Alert>
            ))}
            
            {logs.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No logs yet. Click "Test Login" to start debugging.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DebugLogin;
