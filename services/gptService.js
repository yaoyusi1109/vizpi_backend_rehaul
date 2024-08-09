const { ChatOpenAI } = require("langchain/chat_models/openai")
const { SystemMessage, HumanMessage } = require("langchain/schema")
const fetch = require('node-fetch')
const message = require("../models/message")

const azureApiKey = process.env.UNI_AZURE_OPENAI_API_KEY
const endpoint = "https://itls-openai-connect.azure-api.net/deployments/gpt-35-turbo/chat/completions?api-version=2023-12-01-preview"

exports.functionNameDetect = async (taskDescription) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0
  const messages = [
    { role: "system", content: "For the Programming Task described below, please output the required function name. The output should only contain the function name." },
    { role: "user", content: 'Task Description: ' + taskDescription }
  ]
  const headers = {
    "api-key": azureApiKey,
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }

  const body = JSON.stringify({
    messages: messages
  })
  try {
    const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
    const data = await response.json()
    console.log(data)
    return data.choices[0].message.content
  } catch (err) {
    console.log(err)
    throw err
  }
}

exports.generateUnitTests = async (taskDescription, numOfTest = 3, type) => {
  console.log(taskDescription)
  if (!taskDescription || taskDescription.length == 0)
    return 0

  let typePrompt = ""
  if (type === "Edge") {
    typePrompt = "The tests should only include edge cases and equivalence cases."
  } else if (type === "Equivalence") {
    typePrompt = "The tests should only include equivalence cases and should not include any edge cases."
  } else {
    typePrompt = "The tests should include edge cases and equivalence cases."
  }

  let SystemMessage =
    `For the Programming Task described below, please generate ${numOfTest} unit tests.
        ${typePrompt}
    The unit test should have the following json format:

{
  {
      testName: "Test Name",
      parameter: "param1; param2",
      return: "return value"
  },...
}
{
  "unitTests": [
    {
      testName: "Test Name",
      parameter: "param1; param2",
      return: "return value"
  },...
  ]
}
    The test name should start with "Equivalence case: " or "Edge case: ".
    The output should only contain the array of unit tests in unitTests field in json. And the number of unit tests should be ${numOfTest}.`

  let HumanMessage = 'Task Description: ' + taskDescription

  let messages = [
    { role: "system", content: SystemMessage },
    { role: "user", content: HumanMessage }
  ]
  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }

  const body = JSON.stringify({
    messages: messages
  })

  const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  const data = await response.json()
  try {
    console.log(data)
    const result = JSON.parse(data.choices[0].message.content)
    return result
  } catch (err) {
    throw err
  }
}

exports.validateTests = async (taskDescription) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0

  const messages = [
    { role: "system", content: "Answer in Python only." },
    { role: "user", content: 'Task Description: ' + taskDescription }
  ]
  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }
  const body = JSON.stringify({
    messages: messages
  })
  const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  if (!response.ok) {
    throw new Error('Failed to validate tests')
  }
  const data = await response.json()
  console.log(data.choices[0].message.content)
  let index = data.choices[0].message.content.indexOf("```python")
  if (index !== -1) {
    let trimmed = data.choices[0].message.content.substring(index + 9)
    console.log(trimmed)
    index = trimmed.indexOf("```")
    if (index !== -1) {
      trimmed = trimmed.substring(0, index)
      console.log(trimmed)
    }
    return trimmed
  }

  return data.choices[0].message.content
}

exports.changeTests = async (taskDescription, gptCode, tests) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0
  let responses = []
  for (const test of tests) {
    let messages = [
      { role: "system", content: "You will change code test cases to be correct" },
      { role: "user", content: "given the task:\n" + taskDescription + "\nand the solution:\n" + gptCode + "\n edit this test case to be correct use this format\nName: " + test.testName + "\nParameter: " + test.parameter + "\nReturn Value: " + test.return + "\nDo not include any extra text" }
    ]
    let headers = {
      "Ocp-Apim-Subscription-Key": azureApiKey,
      "Content-Type": "application/json"
    }
    let body = JSON.stringify({
      messages: messages
    })
    let response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
    if (!response.ok) {
      throw new Error('Failed to validate tests')
    }
    let data = await response.json()
    responses.push(data.choices[0].message.content + "\n")

  }
  return responses
}

exports.analyzeTopics = async (messagesInGroup) => {
  if (!messagesInGroup || messagesInGroup.length === 0) {
    return []
  }

  const formatMessages = (messages) => {
    return messages.map(message => ({
      sender: message.dataValues.sender,
      message: message.content
    }))
  }

  const prepareRequestBody = (messages) => {
    const content = `You are given a conversation of a group in JSON form. Analyze the conversation and provide the topics discussed. 
    - You must retrieve 2-5 topics.
    - Each topic should be represented by no more than 8 words.
    - Then for each message, you should index it to its corresponding topic.
    - Some of these sentences are used for transitions and should be ignored.
    - Your response must only contain the Json object of the topics and the indexed messages.
    Here is an example of the expected output: 
    [
    {
      topic: 'Future of AI',
      dialogs: [
        { sender: 'Alice', message: 'AI will revolutionize all industries.' },
        { sender: 'Bob', message: 'Ethics in AI development is crucial.' },
        { sender: 'Carol', message: 'AI and job displacement concerns.' },
      ],
    },
    {
      topic: 'Sustainable Tech',
      dialogs: [
        { sender: 'Grace', message: 'Renewable energy sources are essential.' },
        {
          sender: 'Heidi',
          message: 'Tech companies and their carbon footprints.',
        },
        { sender: 'Ivan', message: 'Innovations in recycling e-waste.' },
      ],
    },
  ]`

    const messagesPayload = [
      { role: "system", content: content },
      { role: "user", content: 'Messages: ' + JSON.stringify(messages) }
    ]

    return JSON.stringify({ messages: messagesPayload })
  }

  const validateResponse = (response) => {
    return response.filter(topicObject => {
      if (typeof topicObject.topic !== 'string' || topicObject.topic.split(' ').length > 8) {
        return false
      }
      if (!Array.isArray(topicObject.dialogs)) {
        return false
      }
      topicObject.dialogs = topicObject.dialogs.filter(dialog => (
        typeof dialog.sender === 'string' && typeof dialog.message === 'string'
      ))
      return true
    })
  }

  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }

  try {
    const formattedMessages = formatMessages(messagesInGroup)
    const body = prepareRequestBody(formattedMessages)

    const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
    const data = await response.json()

    const res = JSON.parse(data.choices[0].message.content)
    const validatedRes = validateResponse(res)

    return validatedRes
  } catch (err) {
    throw new Error(`Failed to analyze topics: ${err.message}`)
  }
}

exports.analyzeNewMessages = async (newMessages, existingTopics) => {
  if (!newMessages || newMessages.length === 0) {
    return existingTopics
  }

  const formatMessages = (messages) => {
    return messages.map(message => ({
      sender: message.dataValues.sender,
      message: message.content
    }))
  }

  const prepareRequestBody = (messages, existingTopics) => {
    const content = `You are given a conversation of a group in JSON form. Analyze the conversation and provide the topics discussed. 
    - You must retrieve 2-5 topics.
    - Each topic should be represented by no more than 8 words.
    - Ensure topics are distinct and not overly similar.
    - Then for each message, you should index it to its corresponding topic.
    - Some of these sentences are used for transitions and should be ignored.
    - Your response must only contain the Json object of the topics and the indexed messages.
    - You need to first consider if you can use the existing topics: ${JSON.stringify(existingTopics.map(topic => topic.topic))}
    - You should limit the total number of topics to 5.
    Here is an example of the expected output: 
    [
    {
      topic: 'Future of AI',
      dialogs: [
        { sender: 'Alice', message: 'AI will revolutionize all industries.' },
        { sender: 'Bob', message: 'Ethics in AI development is crucial.' },
        { sender: 'Carol', message: 'AI and job displacement concerns.' },
      ],
    },
    {
      topic: 'Sustainable Tech',
      dialogs: [
        { sender: 'Grace', message: 'Renewable energy sources are essential.' },
        {
          sender: 'Heidi',
          message: 'Tech companies and their carbon footprints.',
        },
        { sender: 'Ivan', message: 'Innovations in recycling e-waste.' },
      ],
    },
  ]`

    const messagesPayload = [
      { role: "system", content: content },
      { role: "user", content: 'Messages: ' + JSON.stringify(messages) }
    ]

    return JSON.stringify({ messages: messagesPayload })
  }

  const mergeResults = (existingTopics, newTopics) => {
    newTopics.forEach(newTopic => {
      const existingTopic = existingTopics.find(topic => topic.topic === newTopic.topic)
      if (existingTopic) {
        existingTopic.dialogs.push(...newTopic.dialogs)
      } else {
        existingTopics.push(newTopic)
      }
    })
    return existingTopics
  }

  const validateResponse = (response) => {
    return response.filter(topicObject => {
      if (typeof topicObject.topic !== 'string' || topicObject.topic.split(' ').length > 8) {
        return false
      }
      if (!Array.isArray(topicObject.dialogs)) {
        return false
      }
      topicObject.dialogs = topicObject.dialogs.filter(dialog => (
        typeof dialog.sender === 'string' && typeof dialog.message === 'string'
      ))
      return true
    })
  }

  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }

  try {
    const formattedMessages = formatMessages(newMessages)
    const body = prepareRequestBody(formattedMessages, existingTopics)

    const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
    const data = await response.json()
    console.log(data)

    const res = JSON.parse(data.choices[0].message.content)

    const validatedNewTopics = validateResponse(res)

    const mergedTopics = mergeResults(existingTopics, validatedNewTopics)

    return mergedTopics
  } catch (err) {
    throw new Error(`Failed to analyze topics: ${err.message}`)
  }
}


exports.classify = async (messages) => {
  if (!messages || messages.length == 0)
    return "Silent"
  let trimMessages = messages.map((message) => {
    return message.content
  })
  let gptMessages = [
    { role: "system", content: "You will classify users based on their messages" },
    { role: "user", content: "Using all the below messages to classify this user into \"Helpful\", \"Silent\", \"Inquisitive\". Respond with the class only and no additional text\n\nUser:\n" + trimMessages.join('\n') }
  ]
  let headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }
  let body = JSON.stringify({
    messages: gptMessages
  })
  let response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  if (!response.ok) {
    throw new Error('Failed to validate tests')
  }
  let data = await response.json()
  // console.log("the data",data.choices[0])
  // console.log("the message", data.choices[0].message)
  return data.choices[0].message
}

// import { ChatOpenAI } from "langchain/chat_models/openai"
// import { HumanMessage, SystemMessage } from "langchain/schema"


// export async function changeTests (taskDescription, gptCode, test) {
//     if (!taskDescription || taskDescription.length == 0)
//       return 0

//     const chat = new ChatOpenAI({
//       openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
//       model: "gpt-3.5-turbo",
//       temperature: 0.0,
//     })

//     const response = await chat.call([
//       new SystemMessage(
//         'You will change code test cases to be correct'
//       ),
//       new HumanMessage(
//         "given the task:\n" + taskDescription + "\nand the solution:\n" + gptCode + "\n edit this test case to be correct use this format\nName: "+ test.testName + "\nParameter: " + test.parameter + "\nReturn Value: " + test.return + "\nDo not include any extra text"
//       ),
//     ])

//     return response.content.trim()
//   }


exports.generateQuiz = async (taskDescription) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0

  let numOfTest = 2


  let SystemMessage =
    `For the Programming Task described below, please generate ${numOfTest} unit tests and ${numOfTest} multiple choice questions.
    The tests should only include equivalence cases.
    After generating the tests, provide a hint to guide the students who answered the unit tests questions or multiple choice questions incorrectly.
    Lastly, provide the function name of the task.
    The unit test should have the following json format:

{
  {
      parameter: "param1; param2",
      return: "return value"
  },...
}
  The multiple choice question should have the following json format with exactly 3 choices. The correct return value should be one of the choices. 
   Each multiple choice question should have the following json format:
{
  {
    parameter: "param1; param2",
    return: "return value",
    choices: ["choice1", "return value", "choice3"]
  }
}
  The hint should take the task description, the unit test and multiple choice questions into account. For example:
  Task Description: Write a function in python named sum_2 that takes two integers as parameters and returns their sum as an integer.
  "unitTests":[ {parameter: "1; 2", return: "3"}, {parameter: "2; 3", return: "5"}],
  "multipleChoice": [{parameter: "-3; 2", return: "-1", choices: ["-1", "2", "3"]}, {parameter: "3; 5", return: "8", choices: ["5", "7", "8"]}],
  "hint": "Make sure you fully grasp the task description. Also, double check if you are correctly adding the two integers. Pay attention to the signs when dealing with negative numbers.",
  "functionName": "sum_2"
{
  "unitTests": [
    {
      parameter: "param1; param2",
      return: "return value"
  },...
  ],
  "multipleChoice": [
    {
      parameter: "param1; param2",
      return: "return value",
      choices: ["return value", "choice2", "choice3"]
    }, ...
  ],
  "hint" : "hint for the students who answered the unitTests or multiplechoice questions above incorrectly",
  "functionName": "required function name"
}
    The output should contain the array of ${numOfTest} unit tests in unitTests field, another array of ${numOfTest} multiple choice questions in multipleChoice field, a hint and the function name stored in the hint field in json.`

  let HumanMessage = 'Task Description: ' + taskDescription

  let messages = [
    { role: "system", content: SystemMessage },
    { role: "user", content: HumanMessage }
  ]
  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }

  const body = JSON.stringify({
    messages: messages
  })

  const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  const data = await response.json()
  try {
    const result = JSON.parse(data.choices[0].message.content)
    return result
  } catch (err) {
    throw err
  }
}

exports.generateTaskDescription = async (taskDescription) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0

  let SystemMessage =
    `Given the current task description, rewrite it as one complete sentence so it contains all of the following information:
    Be specific and concise. Do not be generic. The sentence should include:
    1. a clear task purpose.
    2. a clear function name.
    3. specified type and requirements of the parameters and return value.

    For example:
    "Task Description: Write a function in python named sum_2 that returns the sum of 2 numbers."
    The generated task description should be:
    "Write a function named sum_2 that takes two integers as parameters and returns their sum as integer."

    For another example:
    "Task Description: Write a function that"
    The generated task description should as specific as possible, for example:
    "Write a function that takes in a list of integers and returns the sum of the list as an integer."

    The responded sentence should with the task description directly, without including with "Task Description:" or "Output:".
    `

  let HumanMessage = ''
  if (taskDescription && taskDescription.length > 0) {
    HumanMessage = "Task Description" + taskDescription
  }
  const messages = [
    { role: "system", content: SystemMessage },
    { role: "user", content: 'Task Description: ' + HumanMessage }
  ]
  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }
  const body = JSON.stringify({
    messages: messages
  })
  const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  if (!response.ok) {
    throw new Error('Failed to validate tests')
  }
  const data = await response.json()
  return data.choices[0].message.content
}

exports.generateAudioTaskDescription = async (taskDescription) => {
  if (!taskDescription || taskDescription.length == 0)
    return 0

  let SystemMessage =
    `create an in-class small group of 3 studetns discussion exercise (within 100 words, it should suit for 10 minute period) where the topic is around "${taskDescription}" 
    `

  let HumanMessage = ''
  if (taskDescription && taskDescription.length > 0) {
    HumanMessage = "Task Description" + taskDescription
  }
  const messages = [
    { role: "system", content: SystemMessage },
    { role: "user", content: 'Task Description: ' + HumanMessage }
  ]
  const headers = {
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  }
  const body = JSON.stringify({
    messages: messages
  })
  const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })
  if (!response.ok) {
    throw new Error('Failed to validate tests')
  }
  const data = await response.json()
  return data.choices[0].message.content
}

exports.chatCompletion = async (message) => {
  try {
    if (!message || message.length === 0) {
      // console.log("No message")
      return 0
    }
    // console.log(message)

    const headers = {
      "Ocp-Apim-Subscription-Key": azureApiKey,
      "Content-Type": "application/json"
    }

    const body = JSON.stringify({
      messages: message
    })

    const response = await fetch(endpoint, { method: "POST", headers: headers, body: body })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get responses: ${response.status} - ${response.statusText}. Response: ${errorText}`)
    }

    const data = await response.json()
    console.log(data.choices[0].message)
    return data.choices[0].message

  } catch (error) {
    console.error('Error:', error)
    return `Error: ${error.message}`
  }
}




exports.correctAnswers = async (taskDescription) => {
  // 检查任务描述是否为空
  if (!taskDescription || taskDescription.length === 0) {
    return 0;
  }

  // 构造消息数组，包括系统消息和用户消息
  const messages = [
    {
      role: "system",
      content: `Given the ${taskDescription}, provide your correct answer in Python. Be specific and concise. Noted that the audience are college students so the methodology behind your answer should not be too complicated, ideally readable and understandable to freshmen or sophomores.
      
      In addition, your answer should include:
      1. useful comments 
      2. knowledge components covered in the question.
      `
    },
    {
      role: "user",
      content: 'Task Description: ' + taskDescription
    }
  ];

  // 设置请求头
  const headers = {
    "api-key": azureApiKey,
    "Ocp-Apim-Subscription-Key": azureApiKey,
    "Content-Type": "application/json"
  };

  // 构造请求体
  const body = JSON.stringify({
    messages: messages
  });

  try {
    // 向 OpenAI 端点发送 POST 请求
    const response = await fetch(endpoint, { method: "POST", headers: headers, body: body });
    const data = await response.json();
    console.log("data==>",data)
    console.log("data.choices[0].message==>",data.choices[0].message)
    // 返回生成的示例答案
    return data.choices[0].message.content;
  } catch (err) {
    // 捕获并记录错误
    console.error('Error generating sample answer:', err);
    throw err;
  }
}
