const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Add admin role check middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get system analytics data
 *     description: Retrieves analytics data including ticket statistics, user activity, and performance metrics. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticketStats:
 *                   type: object
 *                   properties:
 *                     totalTickets:
 *                       type: number
 *                       example: 87
 *                     openTickets:
 *                       type: number
 *                       example: 23
 *                     resolvedTickets:
 *                       type: number
 *                       example: 64
 *                     averageResponseTime:
 *                       type: number
 *                       example: 4.3
 *                     description: Average response time in hours
 *                 userActivity:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 156
 *                     activeUsers:
 *                       type: number
 *                       example: 45
 *                     newUsers:
 *                       type: object
 *                       properties:
 *                         daily:
 *                           type: number
 *                           example: 3
 *                         weekly:
 *                           type: number
 *                           example: 17
 *                         monthly:
 *                           type: number
 *                           example: 32
 *                 timeDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "Technical Support"
 *                       averageResolutionTime:
 *                         type: number
 *                         example: 8.2
 *                       description: Average resolution time in hours
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', auth, isAdmin, getAnalytics);

module.exports = router;