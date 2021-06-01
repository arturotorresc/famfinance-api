import mongodb from "mongodb";
import Expense, { IExpenseDocument } from "./models/expense";
import Frequency, { IFrequencyDocument } from "./models/Frequency";
import Goal, { IGoalDocument } from "./models/goal";
import Income, { IIncomeDocument } from "./models/income";
import Family, { IFamilyDocument } from "./models/family";
import Policy, { IPolicyDocument } from "./models/policy";
import User, { IUserDocument, UserRoleEnum } from "./models/user";
import bcrypt from "bcrypt";

// EXPENSE
async function findExpenseById(id: string): Promise<IExpenseDocument | null> {
  return await Expense.findById({ _id: id }).populate("frequency").exec();
}

async function findUserExpenses(id: string): Promise<IExpenseDocument[]> {
  return await Expense.find({ belongsTo: id }).populate("frequency").exec();
}

async function createExpense(expenseArgs: any): Promise<IExpenseDocument> {
  const expense = new Expense(expenseArgs);
  return await expense.save();
}

async function updateExpenseById(
  id: string,
  expenseArgs: any
): Promise<IExpenseDocument | null> {
  return await Expense.findByIdAndUpdate({ _id: id }, expenseArgs);
}

async function deleteExpenseById(id: string): Promise<IExpenseDocument | null> {
  return await Expense.findOneAndDelete({ _id: id });
}

async function findFamilyExpenses(
  memberIds: mongodb.ObjectID[]
): Promise<IExpenseDocument[]> {
  const query: { belongsTo: mongodb.ObjectID }[] = [];
  memberIds.forEach((id) => {
    query.push({ belongsTo: id });
  });
  return await Expense.find({ $or: query }).populate("frequency").exec();
}

async function findFamilyExpensesByFamilyAndCategory(
  id: any,
  family: IFamilyDocument,
  category: any
): Promise<IExpenseDocument[]> {
  const belongsToArray = family.members.map((userId) => {
    return Object.assign(
      {},
      { belongsTo: userId },
      category ? { category: category } : null
    );
  });
  belongsToArray.push(
    Object.assign(
      {},
      { belongsTo: family.admin },
      category ? { category: category } : null
    )
  );
  let query: any = {
    $or: belongsToArray,
  };
  if (id) {
    query = { $and: [{ _id: id }, { $or: belongsToArray }] };
  }
  return await Expense.find(query).populate("frequency").exec();
}

// INCOME
async function findIncomeById(id: string): Promise<IIncomeDocument | null> {
  return await Income.findById({ _id: id }).populate("frequency").exec();
}

async function findUserIncomes(id: string): Promise<IIncomeDocument[]> {
  return await Income.find({ belongsTo: id }).populate("frequency").exec();
}

async function createIncome(incomeArgs: any): Promise<IIncomeDocument> {
  const income = new Income(incomeArgs);
  return await income.save();
}

async function updateIncomeById(
  id: string,
  incomeArgs: any
): Promise<IIncomeDocument | null> {
  return await Income.findByIdAndUpdate({ _id: id }, incomeArgs);
}

async function deleteIncomeById(id: string): Promise<IIncomeDocument | null> {
  return await Income.findOneAndDelete({ _id: id });
}

async function findFamilyIncomes(
  memberIds: mongodb.ObjectID[]
): Promise<IIncomeDocument[]> {
  const query: { belongsTo: mongodb.ObjectID }[] = [];
  memberIds.forEach((id) => {
    query.push({ belongsTo: id });
  });
  return await Income.find({ $or: query }).populate("frequency").exec();
}

async function findFamilyIncomesByFamilyAndCategory(
  id: any,
  family: IFamilyDocument,
  category: any
): Promise<IIncomeDocument[]> {
  const belongsToArray = family.members.map((userId) => {
    return Object.assign(
      {},
      { belongsTo: userId },
      category ? { category: category } : null
    );
  });
  belongsToArray.push(
    Object.assign(
      {},
      { belongsTo: family.admin },
      category ? { category: category } : null
    )
  );
  let query: any = {
    $or: belongsToArray,
  };
  if (id) {
    query = { $and: [{ _id: id }, { $or: belongsToArray }] };
  }
  return await Income.find(query).populate("frequency").exec();
}

// FREQUENCY
async function createFrequency(
  frequencyArgs: any
): Promise<IFrequencyDocument> {
  const frequency = new Frequency(frequencyArgs);
  return await frequency.save();
}

async function updateFrequencyForExpenseById(
  expense: IExpenseDocument,
  frequencyArgs: any
): Promise<IFrequencyDocument | null> {
  return await Frequency.findByIdAndUpdate(
    { _id: expense.frequency },
    frequencyArgs
  );
}

async function updateFrequencyForIncomeById(
  income: IIncomeDocument,
  frequencyArgs: any
): Promise<IFrequencyDocument | null> {
  return await Frequency.findByIdAndUpdate(
    { _id: income.frequency },
    frequencyArgs
  );
}

async function deleteFrequencyById(
  id: mongodb.ObjectID
): Promise<IFrequencyDocument | null> {
  return await Frequency.findOneAndDelete({ _id: id });
}

// GOAL
async function createGoal(goalArgs: any): Promise<IGoalDocument> {
  const goal = new Goal(goalArgs);
  return await goal.save();
}

async function findUserGoals(id: string): Promise<IGoalDocument[]> {
  return await Goal.find({ belongsTo: id }).exec();
}

async function findFamilyGoals(
  memberIds: mongodb.ObjectID[]
): Promise<IGoalDocument[]> {
  const query: { belongsTo: mongodb.ObjectID }[] = [];
  memberIds.forEach((id) => {
    query.push({ belongsTo: id });
  });
  return await Goal.find({ $or: query }).populate("frequency").exec();
}

async function updateGoalById(
  id: string,
  goalArgs: any
): Promise<IGoalDocument | null> {
  return await Goal.findByIdAndUpdate(id, goalArgs, { new: true }).exec();
}

async function deleteGoalById(id: string): Promise<IGoalDocument | null> {
  return await Goal.findOneAndDelete({ _id: id }).exec();
}

// POLICY
async function createPolicyForUserByUserId(id: any, permissions: any) {
  const policy = new Policy({
    belongsTo: id,
    permissions: permissions,
  });
  await policy.save();
}

async function findPolicyOfUser(user_id: any): Promise<IPolicyDocument | null> {
  return await Policy.findOne({ belongsTo: user_id });
}

// USER
async function checkIfEmailExists(email: any): Promise<boolean> {
  return await User.exists({ email });
}

async function findUserById(id: any): Promise<IUserDocument | null> {
  return await User.findById(id);
}

async function updateUser(
  id: any,
  userArgs: any
): Promise<IUserDocument | null> {
  return await User.findByIdAndUpdate(id, userArgs, { new: true }).exec();
}

async function getFamilyUsers(userIds: any[]): Promise<IUserDocument[]> {
  return await User.find({
    $or: userIds,
  }).exec();
}

async function saveUserWithPolicy(
  {
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  },
  role: UserRoleEnum
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name: name.trim(),
    email,
    password: hashedPassword,
    role: role,
  });
  const savedUser = await user.save();
  await createPolicyForUserByUserId(savedUser._id, getDefaultPermissions());
  return { savedUser };
}

function getDefaultPermissions() {
  return [];
}

// FAMILY
async function findFamilyById(id: any): Promise<IFamilyDocument | null> {
  return await Family.findOne({ familyId: id });
}

async function createFamily(admin_id: any): Promise<IFamilyDocument> {
  const family = new Family({
    admin: admin_id,
  });
  return await family.save();
}

async function checkIfUserBelongsToFamily(
  adminId: any,
  memberId: any
): Promise<boolean> {
  return await Family.exists({
    admin: adminId,
    members: memberId,
  });
}

export {
  createFrequency,
  createExpense,
  updateExpenseById,
  findExpenseById,
  deleteExpenseById,
  updateFrequencyForExpenseById,
  updateFrequencyForIncomeById,
  deleteFrequencyById,
  createGoal,
  findUserGoals,
  updateGoalById,
  deleteGoalById,
  findFamilyExpenses,
  findFamilyIncomes,
  findUserExpenses,
  findUserIncomes,
  createPolicyForUserByUserId,
  findFamilyExpensesByFamilyAndCategory,
  updateIncomeById,
  findUserById,
  checkIfUserBelongsToFamily,
  findPolicyOfUser,
  checkIfEmailExists,
  createFamily,
  saveUserWithPolicy,
  updateUser,
  getFamilyUsers,
  findFamilyById,
  findIncomeById,
  createIncome,
  deleteIncomeById,
  findFamilyIncomesByFamilyAndCategory,
  findFamilyGoals,
};
