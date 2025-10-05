// server/routes/tickets.js
const express = require('express');
const prisma = require('../db');
const { addHours } = require('date-fns');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// ## Create a new ticket ##
// All logged-in users can create a ticket.
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const creatorId = req.user.userId;

    // Calculate SLA Deadline based on priority
    const now = new Date();
    let slaDeadline;
    switch (priority) {
      case 'HIGH':
        slaDeadline = addHours(now, 24);
        break;
      case 'MEDIUM':
        slaDeadline = addHours(now, 72);
        break;
      case 'LOW':
      default:
        slaDeadline = addHours(now, 120); // 5 days
        break;
    }

    const ticket = await prisma.ticket.create({
      data: { title, description, priority, creatorId, slaDeadline },
    });

    // Log this action in the timeline
    await prisma.timelineEvent.create({
      data: {
        action: 'TICKET_CREATED',
        details: `Ticket created with priority ${priority}`,
        actorId: creatorId,
        ticketId: ticket.id,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket.', details: error.message });
  }
});

// ## Get all tickets (with pagination, search, and filters) ##
router.get('/', authenticateToken, async (req, res) => {
    const { limit = 10, offset = 0, status, q: searchQuery } = req.query;

    const where = {};
    if (status) where.status = status;
    if (searchQuery) {
        where.OR = [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
        ];
    }

    try {
        const tickets = await prisma.ticket.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { createdAt: 'desc' },
            include: { creator: { select: { name: true } } },
        });

        const totalTickets = await prisma.ticket.count({ where });

        // Add isBreached flag
        const now = new Date();
        const ticketsWithBreachStatus = tickets.map(ticket => ({
            ...ticket,
            isBreached: ticket.status !== 'CLOSED' && now > new Date(ticket.slaDeadline),
        }));

        res.status(200).json({
            data: ticketsWithBreachStatus,
            total: totalTickets,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(totalTickets / limit),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets.', details: error.message });
    }
});

// ## Get a single ticket by ID ##
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } },
        comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
        timelineEvents: { include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket.', details: error.message });
  }
});

// ## Add a comment to a ticket ##
router.post('/:id/comments', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = req.user.userId;

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                ticketId: parseInt(id),
                authorId,
            },
            include: { author: { select: { name: true } } },
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment.', details: error.message });
    }
});

// ## Update a ticket (e.g., change status, assign agent) ##
// Only agents and admins can do this.
router.patch('/:id', authenticateToken, authorizeRole(['AGENT', 'ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { status, agentId, version } = req.body;
    const actorId = req.user.userId;

    // Optimistic Locking Check
    if (typeof version !== 'number') {
        return res.status(400).json({ error: 'Invalid version number provided for update.' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const currentTicket = await tx.ticket.findUnique({
                where: { id: parseInt(id) },
            });

            if (!currentTicket) throw new Error('NOT_FOUND');
            if (currentTicket.version !== version) throw new Error('CONFLICT');

            const updatedTicket = await tx.ticket.update({
                where: { id: parseInt(id) },
                data: {
                    status,
                    agentId,
                    version: { increment: 1 }, // Increment version
                },
            });

            // Log the status change
            if (status && status !== currentTicket.status) {
                await tx.timelineEvent.create({
                    data: {
                        action: 'STATUS_CHANGED',
                        details: `Status changed from ${currentTicket.status} to ${status}`,
                        actorId,
                        ticketId: updatedTicket.id,
                    },
                });
            }

            return updatedTicket;
        });
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'CONFLICT') {
            return res.status(409).json({ error: 'Conflict: This ticket has been updated by someone else. Please refresh and try again.' });
        }
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Ticket not found.' });
        }
        res.status(500).json({ error: 'Failed to update ticket.', details: error.message });
    }
});

module.exports = router;