export default class extends DBClient {
  getPaymentLog(user_id) {
    return this.exec(['user_payments'], async (collections) => {
      return await collections.user_payments.find(
        {
          user_id : { $eq: user_id }
        }
      ).sort({date: -1 }).toArray();
    });
  }

  addPaymentLog(paymentId, user_id, obj) {
    return this.exec(['user_payments'], async (collections) => {
      let payment = null;
      if (paymentId) {
        payment = await collections.user_payments.findOne(
          {
            id : { $eq: paymentId}
          }
        );
      }

      if (!payment) {
        return await collections.user_payments.insertOne({
          id: paymentId,
          user_id,
          date: new Date(),
          ...obj
        });
      }
      return null;
    });
  }

  async takePaymentAmount(userId, amount, prompt_id) {
    amount = parseInt(amount);
    if (!amount) {
      console.error('Not charging anything, userId:', userId);
      return true;
    } else {
      const r = await this.replaceUser(userId, (user) => {
        if (user.amount < amount) {
          return false;
        }
        user.amount -= amount;
        return true;
      });

      await this.addPaymentLog(
        null, userId,
        { type: "payment", amount: 0-amount, prompt_id }
      );

      return r;
    }
  }

  addPaymentAmount(userId, paymentId, paymentObj, amount) {
    return this.exec([], async () => {
      const paymentRes = await this.addPaymentLog(paymentId, userId, { amount, ...paymentObj} );
      if (paymentRes) {
        return await this.replaceUser(userId, (user) => {
          user.amount += parseInt(amount);
        });
      } else {
        console.warn('Payment has already been done', paymentId);
        return null;
      }
    });
  }

  getUser(id) {
    return this.exec(['user_accounts'], (collections) => {
      return collections.user_accounts.findOne({ id: { $eq: id } });
    });
  }

  replaceUser(id, func) {
    return this.exec(['user_accounts'], async (collections) => {
      const { user_accounts } = collections;
      let user = await user_accounts.findOne({id: { $eq: id} });
      if (!user) {
        user = {id};
      }
      await func(user);
      user_accounts.createIndex( { id : 1 });
      return await user_accounts.replaceOne(
        {id: { $eq: id} },
        user,
        {
          upsert: true,
          writeConcern: {
            journal: true
          }
        }
      );
    });
  }
};
