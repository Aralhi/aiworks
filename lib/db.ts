import clientPromise from "./dbConnect"

export async function find(name: string, filter: any, sortBy?: any) {
  try {
    const client = await clientPromise
    const Schema = await client.db().collection(name)
    const cursor = await Schema.find(filter).sort(sortBy)
    return cursor.toArray()
  } catch (error) {
    console.error(`findOne ${name} error`, error)
  }
}

export async function findOne(name: string, filter: any) {
  try {
    const client = await clientPromise
    const Schema = await client.db().collection(name)
    const result = await Schema.findOne(filter)
    if (result?._id) {
      console.log(`findOne ${name} success`, result._id)
      return result
    } else {
      console.log(`findOne ${name} not found`)
    }
  } catch (error) {
    console.error(`findOne ${name} error`, error)
  }
}

export async function insertOne(name: string, data: any) {
  try {
    const client = await clientPromise
    const Schema = await client.db().collection(name)
    const result = await Schema.insertOne(data)
    if (result.acknowledged) {
      console.log(`insertOne ${name} success`, result)
      return result
    } else {
      console.log(`insertOne ${name} not found`)
    }
  } catch (error) {
    console.error(`insertOne ${name} error`, error)
  }
}

export async function findOneAndUpdate(name: string, filter: any, update: any, option?: any) {
  try {
    const client = await clientPromise;
    const Schema = await client.db().collection(name);
    const result = await Schema.findOneAndUpdate(filter, update, option);
    if (result.lastErrorObject?.updatedExisting) {
      console.log(`findOneAndUpdate ${name} success`, result);
      return result;
    } else {
      console.log(`findOneAndUpdate ${name} not found`);
    }
  } catch (error) {
    console.error(`findOneAndUpdate ${name} error`, error);
  }
}

export async function deleteOne(name: string, filter: any) {
  try {
    const client = await clientPromise;
    const Schema = await client.db().collection(name);
    const result = await Schema.deleteOne(filter);
    if (result.acknowledged) {
      console.log(`deleteOne ${name} success`, result);
      return result;
    } else {
      console.log(`deleteOne ${name} not found`);
    }
  } catch (error) {
    console.error(`deleteOne ${name} error`, error);
  }
}

export async function countDocuments(name: string, filter: any) {
  try {
    const client = await clientPromise;
    const Schema = await client.db().collection(name);
    const result = await Schema.countDocuments(filter);
    return result;
  } catch (error) {
    console.error(`countDocuments ${name} error`, error);
  }
}

export async function updateMany(name: string, filter: any, update: any) {
  try {
    const client = await clientPromise;
    const Schema = await client.db().collection(name);
    const result = await Schema.updateMany(filter, update);
    if (result.matchedCount > 0) {
      console.log(`updateMany ${name} success`, result);
      return result;
    } else {
      console.log(`updateMany ${name} not found`);
    }
  } catch (error) {
    console.error(`updateMany ${name} error`, error);
  }
}
