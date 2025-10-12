export default class extends DBClient {
  getPrompts(userId) {
    return this.exec(['prompts'], (collections) => {
      return collections.prompts.findOne({id: { $eq: userId} });
    });
  }

  async getPromptsAmount(userId) {
    const promptObj = await this.getPrompts(userId);
    let price=0;
    let count=0;
    if (promptObj?.prompt_infos) {
      for (const promptInfo of promptObj.prompt_infos) {
        price += promptInfo.price;
        ++count;
      }
    }
    return {price, count};
  }

  setPromptInfos(userId, promptInfos) {
    return this.exec(['prompts'], async (collections) => {
      return collections.prompts.replaceOne(
        {
          id: { $eq: userId} 
        },
        { id: userId, prompt_infos: promptInfos }, {upsert: true}
      );
    });
  }

  addPromptToQueue(userId, promptInfo) {
    return this.exec(['prompts'], async (collections) => {
      let promptObj = await collections.prompts.findOne({id: { $eq: userId} });
      if (!promptObj) {
        promptObj = { id: userId, prompt_infos: [] };
      }

      let found = false;
      for(const id of promptObj.prompt_infos) {
        if (id === promptInfo.prompt_id) {
          found = true;
          break;
        }
      }
      if (!found) {
        promptObj.prompt_infos.push(promptInfo);
      }

      collections.prompts.createIndex( { id : 1 });
      return collections.prompts.replaceOne(
        {
          id: { $eq: userId} 
        },
        promptObj, {upsert: true}
      );
    });
  }
}
