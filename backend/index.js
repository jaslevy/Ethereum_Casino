// socket server
const http = require('http');
const socketIo = require('socket.io');
// Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Socket.IO server is running');
});

const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust according to your frontend's origin
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A client connected');
    socket.emit('welcome', 'Welcome to the real-time server!');
    
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
