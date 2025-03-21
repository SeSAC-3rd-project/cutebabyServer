import db from "../config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const babycreate = async (req, res) => {
  console.log(req.file);

  const { usernumber, babyname, birthday, gender } = req.body;
  let picture = req.file ? req.file.buffer : null; // 🚀 파일을 `BLOB`으로 저장

  if (!babyname || !birthday || !gender) {
    return res
      .status(400)
      .json({ success: false, message: "모든 필수 데이터를 입력하세요." });
  }
  if (req.file) {
    picture = req.file.buffer; // 🚀 업로드된 파일을 `BLOB`으로 저장
  } else {
    console.warn("⚠️ 파일이 업로드되지 않았습니다. 기본 이미지 사용.");
    const defaultImagePath = path.join(
      __dirname,
      "../../../public/img/babybasic.png"
    );

    try {
      picture = fs.readFileSync(defaultImagePath); // 🚀 기본 이미지 파일을 `BLOB`으로 변환
    } catch (error) {
      console.error("❌ 기본 이미지 파일을 읽을 수 없습니다:", error);
      picture = Buffer.alloc(0); // 🚨 파일이 없을 경우 빈 데이터 저장
    }
  }

  const sql = `INSERT INTO babyinfo (babyname, usernumber , birthday, gender, picture) 
  VALUES (?, ?, ?, ?,?)`;
  const values = [babyname, usernumber, birthday, gender, picture];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(" MySQL 삽입 오류:", err);
      return res
        .status(500)
        .json({ success: false, message: "데이터베이스 오류", error: err });
    }
    res.status(201).json({
      success: true,
      message: "아기 정보 등록 성공!",
      babyId: result.insertId,
    });
  });
};

////////////////////////////////////////
export const updateBaby = async (req, res) => {
  console.log("🔍 유저 수정 요청 도착 (BODY):", req.body);
  console.log("📂 업로드된 파일:", req.file);

  try {
    const { babyid, babyname, birthday, gender, existingPicture } = req.body;
    let picture = req.file ? req.file.buffer : null;

    // ✅ 1. 기본 이미지로 바꾸려는 경우
    if (existingPicture === "data:image/jpeg;base64,") {
      console.log("✅ 기본 이미지로 변경합니다.");
      const defaultImagePath = path.join(
        __dirname,
        "../../../public/img/babybasic.png"
      );

      try {
        picture = fs.readFileSync(defaultImagePath);
      } catch (error) {
        console.error("❌ 기본 이미지 파일을 읽을 수 없습니다:", error);
        picture = Buffer.alloc(0);
      }
    }

    // ✅ 2. 새 파일이 업로드된 경우
    else if (req.file) {
      picture = req.file.buffer;
    }

    // ✅ 3. 아무것도 변경되지 않은 경우 (기존 이미지 유지)
    else if (!existingPicture) {
      console.log("✅ 기존 이미지 유지");
      const [rows] = await db.execute(
        "SELECT picture FROM babyinfo WHERE babyid = ?",
        [babyid]
      );
      if (rows.length > 0) {
        picture = rows[0].picture;
      }
    }

    // ✅ 동적으로 UPDATE 쿼리 생성
    let sql = "UPDATE babyinfo SET";
    let values = [];
    let fieldsToUpdate = [];

    if (babyname) {
      fieldsToUpdate.push(" babyname = ?");
      values.push(babyname);
    }
    if (birthday) {
      fieldsToUpdate.push(" birthday = ?");
      values.push(birthday);
    }
    if (gender) {
      fieldsToUpdate.push(" gender = ?");
      values.push(gender);
    }
    if (picture) {
      fieldsToUpdate.push(" picture = ?");
      values.push(picture);
    }

    if (fieldsToUpdate.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "변경할 데이터가 없습니다." });
    }

    sql += fieldsToUpdate.join(",");
    sql += " WHERE babyid = ?";
    values.push(babyid);

    // ✅ MySQL 업데이트 실행
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ MySQL 업데이트 오류:", err);
        return res
          .status(500)
          .json({ success: false, message: "데이터베이스 오류", error: err });
      }
      res.status(200).json({
        success: true,
        message: "아기 정보가 성공적으로 수정되었습니다.",
        updatedData: { babyid, babyname, birthday, gender },
      });
    });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};
