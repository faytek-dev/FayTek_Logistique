const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Créer une nouvelle tâche
// @route   POST /api/tasks
// @access  Private (Admin, Dispatcher)
exports.createTask = async (req, res) => {
    try {
        const taskData = {
            ...req.body,
            createdBy: req.user.id
        };

        const task = await Task.create(taskData);

        // Peupler les références
        await task.populate('createdBy assignedTo', 'name email role');

        // Si la tâche est assignée, créer une notification
        if (task.assignedTo) {
            await Notification.create({
                recipient: task.assignedTo._id,
                type: 'task_assigned',
                title: 'Nouvelle tâche assignée',
                message: `Vous avez été assigné à la tâche: ${task.title}`,
                relatedTask: task._id,
                data: { taskId: task._id, taskTitle: task.title }
            });

            // Émettre via Socket.IO (sera géré dans socket/index.js)
            if (req.app.get('io')) {
                req.app.get('io').to(`user_${task.assignedTo._id}`).emit('task:assigned', {
                    task,
                    notification: {
                        title: 'Nouvelle tâche assignée',
                        message: `Vous avez été assigné à la tâche: ${task.title}`
                    }
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Tâche créée avec succès',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la tâche',
            error: error.message
        });
    }
};

// @desc    Obtenir toutes les tâches
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        let query = {};

        // Filtrage selon le rôle
        if (req.user.role === 'courier') {
            // Le coursier ne voit que ses tâches
            query.assignedTo = req.user.id;
        } else if (req.user.role === 'dispatcher') {
            // Le dispatcher voit les tâches qu'il a créées
            query.createdBy = req.user.id;
        }
        // L'admin voit tout

        // Filtres optionnels
        if (req.query.status) {
            query.status = req.query.status;
        }

        const tasks = await Task.find(query)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role phone currentLocation availability')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des tâches',
            error: error.message
        });
    }
};

// @desc    Obtenir une tâche par ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role phone currentLocation');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée'
            });
        }

        // Vérifier les permissions
        if (req.user.role === 'courier' && task.assignedTo?._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé'
            });
        }

        if (req.user.role === 'dispatcher' && task.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la tâche',
            error: error.message
        });
    }
};

// @desc    Mettre à jour une tâche
// @route   PUT /api/tasks/:id
// @access  Private (Admin, Dispatcher qui l'a créée)
exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée'
            });
        }

        // Vérifier les permissions
        if (req.user.role === 'dispatcher' && task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé'
            });
        }

        const oldAssignedTo = task.assignedTo;

        task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy assignedTo', 'name email role');

        // Si l'assignation a changé, notifier
        if (task.assignedTo && task.assignedTo._id.toString() !== oldAssignedTo?.toString()) {
            await Notification.create({
                recipient: task.assignedTo._id,
                type: 'task_updated',
                title: 'Tâche mise à jour',
                message: `La tâche "${task.title}" a été modifiée`,
                relatedTask: task._id
            });

            if (req.app.get('io')) {
                req.app.get('io').to(`user_${task.assignedTo._id}`).emit('task:updated', { task });
            }
        }

        res.json({
            success: true,
            message: 'Tâche mise à jour',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};

// @desc    Changer le statut d'une tâche
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée'
            });
        }

        // Vérifier les permissions
        if (req.user.role === 'courier' && task.assignedTo?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé'
            });
        }

        // Validation du workflow
        const validTransitions = {
            'CREATED': ['IN_PROGRESS', 'CANCELLED'],
            'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': []
        };

        if (!validTransitions[task.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Transition invalide de ${task.status} vers ${status}`
            });
        }

        task.status = status;
        task._updatedBy = req.user.id;

        // Mettre à jour les timestamps
        if (status === 'IN_PROGRESS' && !task.actualPickupTime) {
            task.actualPickupTime = new Date();
        } else if (status === 'COMPLETED' && !task.actualDeliveryTime) {
            task.actualDeliveryTime = new Date();
        }

        await task.save();
        await task.populate('createdBy assignedTo', 'name email role');

        // Notifier le créateur
        await Notification.create({
            recipient: task.createdBy._id,
            type: 'status_changed',
            title: 'Changement de statut',
            message: `La tâche "${task.title}" est maintenant ${status}`,
            relatedTask: task._id
        });

        if (req.app.get('io')) {
            req.app.get('io').to(`user_${task.createdBy._id}`).emit('task:status:changed', {
                task,
                oldStatus: task.status,
                newStatus: status
            });
        }

        res.json({
            success: true,
            message: 'Statut mis à jour',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
};

// @desc    Supprimer une tâche
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Dispatcher qui l'a créée)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée'
            });
        }

        // Vérifier les permissions
        if (req.user.role === 'dispatcher' && task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé'
            });
        }

        await task.deleteOne();

        res.json({
            success: true,
            message: 'Tâche supprimée'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression',
            error: error.message
        });
    }
};
