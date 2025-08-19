const express = require('express');
const Board = require('../models/Board');

const router = express.Router();

// 홈 페이지 및 게시판 페이지 - 게시글 목록
router.get(['/', '/board/', '/board'], async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const boards = await Board.find()
            .select('title author views createdAt attachments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Board.countDocuments();
        const totalPages = Math.ceil(total / limit);

        console.log('총 게시글 수:', total);
        console.log('조회된 게시글:', boards.length);
        console.log('첫 번째 게시글:', boards[0]);

        res.render('boards/list', {
            title: '게시판',
            boards,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 작성 페이지
router.get('/board/new', (req, res) => {
    res.render('boards/form', {
        title: '게시글 작성',
        isEdit: false
    });
});

// 게시글 상세 보기
router.get('/board/:id', async (req, res, next) => {
    try {
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, lean: true }
        );

        if (!board) {
            return res.status(404).render('error', {
                title: '오류',
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.render('boards/detail', {
            title: board.title,
            board
        });
    } catch (error) {
        next(error);
    }
});

// 게시글 수정 페이지
router.get('/board/:id/edit', async (req, res, next) => {
    try {
        const board = await Board.findById(req.params.id).lean();

        if (!board) {
            return res.status(404).render('error', {
                title: '오류',
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.render('boards/form', {
            title: '게시글 수정',
            board,
            isEdit: true
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;