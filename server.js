import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import userRoutes from './routes/userRoutes.js'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// ✅ **CORS 설정 수정**
const allowedOrigins = [
  'http://localhost:3000',  
  'https://wrigglebaby.netlify.app', // Netlify 프론트엔드 주소 추가
];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true, // ✅ 쿠키 및 인증 정보 포함
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // ✅ 허용할 HTTP 메서드 명시
  allowedHeaders: "Content-Type,Authorization", // ✅ 허용할 헤더 명시
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 환경에서는 true로 변경
}));

// API 라우트 적용
app.use('/api', userRoutes);

// 서버 실행
app.listen(port, () => {
  console.log(`✅ 서버가 실행 중: https://3.36.120.219 (포트: ${port})`);
});
