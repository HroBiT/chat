const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(cors({
    origin: 'http://localhost:3000', // Zezwalamy na żądania z localhost:3000
}));

// Konfiguracja połączenia z bazą danych MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root', // Zmień na swoje dane użytkownika
    password: '', // Zmień na swoje hasło
    database: 'chat', // Zmień na nazwę swojej bazy danych
};

// Funkcja do inicjalizacji tabeli, jeśli jeszcze nie istnieje
async function initializeDatabase() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await connection.end();
}

// Inicjalizacja bazy danych
initializeDatabase().catch((err) => {
    console.error('Błąd podczas inicjalizacji bazy danych:', err);
});

// Endpoint REST do pobierania wszystkich wiadomości
app.get('/messages', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM messages ORDER BY timestamp ASC');
        await connection.end();

        res.json(rows); // Wysyłamy wiadomości w formacie JSON
    } catch (err) {
        console.error('Błąd podczas pobierania wiadomości:', err);
        res.status(500).json({ error: 'Nie udało się pobrać wiadomości' });
    }
});

async function deleteMessage(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM messages WHERE id = ?', [id]);
    await connection.end();
}


io.on('connection', (socket) => {
    console.log('Nowy użytkownik połączony:', socket.id);

    socket.on('message', async (msg) => {
        console.log('Otrzymano wiadomość:', msg);

        // Zapisz wiadomość w bazie danych
        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.execute('INSERT INTO messages (content) VALUES (?)', [msg]);
            await connection.end();
        } catch (err) {
            console.error('Błąd podczas zapisywania wiadomości w bazie danych:', err);
        }

        // Emituj wiadomość do wszystkich użytkowników
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Użytkownik rozłączony:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Serwer działa na http://localhost:3001');
});
