const recurringTransactionRepository = require('../repositories/recurringTransactionRepository');
const transactionRepository = require('../repositories/transactionRepository');
const logger = require('../config/logger');

class RecurringTransactionService {
  async getAll(userId) {
    return await recurringTransactionRepository.find({ user: userId });
  }

  async create(userId, data) {
    const { amount, category, description, type, frequency, startDate, tags, notes } = data;
    
    // Set initial nextOccurrence
    const start = startDate ? new Date(startDate) : new Date();
    
    return await recurringTransactionRepository.create({
      user: userId,
      amount,
      category,
      description,
      type: type || 'expense',
      frequency: frequency || 'monthly',
      startDate: start,
      nextOccurrence: start, // first run is the start date
      tags: tags || [],
      notes: notes || '',
      isActive: true
    });
  }

  async update(userId, id, data) {
    const recurring = await recurringTransactionRepository.findById(id);
    if (!recurring) {
      throw new Error('Recurring transaction not found');
    }
    if (recurring.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }
    
    return await recurringTransactionRepository.update(id, data);
  }

  async delete(userId, id) {
    const recurring = await recurringTransactionRepository.findById(id);
    if (!recurring) {
      throw new Error('Recurring transaction not found');
    }
    if (recurring.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }
    
    await recurringTransactionRepository.delete(id);
    return { success: true };
  }

  async processRecurringTransactions() {
    logger.info('Running recurring transactions check...');
    try {
      const now = new Date();
      const dueTransactions = await recurringTransactionRepository.find({
        isActive: true,
        nextOccurrence: { $lte: now }
      });

      logger.info(`Found ${dueTransactions.length} due recurring transactions to process`);

      for (const recurring of dueTransactions) {
        let nextDate = new Date(recurring.nextOccurrence);
        let occurrencesCreated = 0;

        while (nextDate <= now) {
          await transactionRepository.create({
            user: recurring.user,
            amount: recurring.amount,
            category: recurring.category,
            description: recurring.description,
            type: recurring.type,
            date: new Date(nextDate),
            tags: recurring.tags,
            notes: recurring.notes
          });

          recurring.lastTriggered = new Date(nextDate);
          nextDate = this.getNextOccurrenceDate(nextDate, recurring.frequency);
          occurrencesCreated++;
        }

        recurring.nextOccurrence = nextDate;
        await recurring.save();
        logger.info(`Processed recurring transaction '${recurring.description}' for user ${recurring.user}: created ${occurrencesCreated} entries. Next run: ${nextDate}`);
      }
    } catch (error) {
      logger.error('Error processing recurring transactions:', { error: error.message, stack: error.stack });
    }
  }

  getNextOccurrenceDate(currentDate, frequency) {
    const next = new Date(currentDate);
    if (frequency === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    }
    return next;
  }
}

module.exports = new RecurringTransactionService();
