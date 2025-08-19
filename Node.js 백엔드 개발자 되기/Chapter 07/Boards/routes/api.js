const express = require('express');
const multer = require('multer');
const path = require('path');
const Board = require('../models/Board');

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('허용되지 않는 파일 형식입니다.'));
        }
    }
});

// 게시글 생성
router.post('/boards', upload.array('files', 5), async (req, res) => {
    try {
        const { title, author, content } = req.body;

        // 필수 필드 검증
        if (!title || !author || !content) {
            return res.status(400).json({
                success: false,
                message: '제목, 작성자, 내용은 필수 항목입니다.'
            });
        }

        // 첨부파일 정보 처리
        const attachments = req.files ? req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        // 새 게시글 생성
        const board = new Board({
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            attachments
        });

        const savedBoard = await board.save();

        res.status(201).json({
            success: true,
            message: '게시글이 성공적으로 작성되었습니다.',
            data: savedBoard
        });

    } catch (error) {
        console.error('게시글 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글 작성 중 오류가 발생했습니다.'
        });
    }
});

// 게시글 수정
router.put('/boards/:id', upload.array('files', 5), async (req, res) => {
    try {
        const { title, author, content } = req.body;
        const boardId = req.params.id;

        // 필수 필드 검증
        if (!title || !author || !content) {
            return res.status(400).json({
                success: false,
                message: '제목, 작성자, 내용은 필수 항목입니다.'
            });
        }

        // 첨부파일 정보 처리
        const attachments = req.files ? req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        // 게시글 업데이트
        const updatedBoard = await Board.findByIdAndUpdate(
            boardId,
            {
                title: title.trim(),
                content: content.trim(),
                author: author.trim(),
                attachments,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedBoard) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '게시글이 성공적으로 수정되었습니다.',
            data: updatedBoard
        });

    } catch (error) {
        console.error('게시글 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글 수정 중 오류가 발생했습니다.'
        });
    }
});

// 게시글 삭제
router.delete('/boards/:id', async (req, res) => {
    try {
        const boardId = req.params.id;

        const deletedBoard = await Board.findByIdAndDelete(boardId);

        if (!deletedBoard) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '게시글이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글 삭제 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;