const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const upload = require('../middleware/upload');

const router = express.Router();

const validateBoard = [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('제목은 1-100자 사이여야 합니다.'),
    body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('내용은 1-5000자 사이여야 합니다.'),
    body('author').trim().isLength({ min: 1, max: 50 }).withMessage('작성자는 1-50자 사이여야 합니다.')
];

// 게시글 목록 조회 (Read - All)
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const boards = await Board.find()
            .select('title author views createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Board.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                boards,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 상세 조회 (Read - One)
router.get('/:id', async (req, res, next) => {
    try {
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!board) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: board
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 생성 (Create)
router.post('/', upload.array('files', 5), validateBoard, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 입력입니다.',
                errors: errors.array()
            });
        }

        const { title, content, author } = req.body;

        const attachments = req.files ? req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        const newBoard = new Board({
            title,
            content,
            author,
            attachments
        });

        const savedBoard = await newBoard.save();

        res.status(201).json({
            success: true,
            data: savedBoard,
            message: '게시글이 성공적으로 생성되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 수정 (Update)
router.put('/:id', upload.array('files', 5), validateBoard, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 입력입니다.',
                errors: errors.array()
            });
        }

        const { title, content, author } = req.body;

        const updateData = {
            title,
            content,
            author,
            updatedAt: Date.now()
        };

        if (req.files && req.files.length > 0) {
            updateData.attachments = req.files.map(file => ({
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        const updatedBoard = await Board.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBoard) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: updatedBoard,
            message: '게시글이 성공적으로 수정되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 삭제 (Delete)
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedBoard = await Board.findByIdAndDelete(req.params.id);

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
        next(error);
    }
});

// 검색 API
router.get('/search/:keyword', async (req, res, next) => {
    try {
        const keyword = req.params.keyword;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { author: { $regex: keyword, $options: 'i' } }
            ]
        };

        const boards = await Board.find(searchQuery)
            .select('title author views createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Board.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                boards,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;