# 需求文档 (Requirements Document)

## 介绍 (Introduction)

AI智能面试系统是一个全流程的自动化招聘平台，融合了计算机视觉、语音交互与大语言模型技术，实现从简历投递到AI视频面试的完整闭环。系统采用"本地感官+云端大脑"架构，通过技术手段还原真实面试场景，解决传统招聘中筛选效率低、面试时间协调难、评价主观性强等痛点。

## 术语表 (Glossary)

- **System**: AI智能面试系统整体
- **Frontend**: React前端应用
- **Backend**: FastAPI后端服务
- **Candidate**: 求职者用户
- **Admin**: 管理员用户
- **HR**: 人力资源用户
- **Job**: 职位信息
- **Application**: 职位申请记录
- **Interview_Session**: 面试会话
- **Observer_Agent**: 基于MediaPipe的视觉监测模块
- **Coze_Service**: 字节跳动扣子AI编排服务
- **STT_Service**: 语音转文字服务
- **TTS_Service**: 文字转语音服务
- **WebSocket_Connection**: 实时双向通信连接
- **Risk_Log**: 面试过程中的异常行为记录
- **Profile_Data**: 候选人画像数据
- **Knowledge_Base**: 职位相关知识库

## 需求 (Requirements)

### 需求 1: 用户认证与授权

**用户故事**: 作为用户，我希望能够安全地注册和登录系统，以便访问相应权限的功能。

#### 验收标准 (Acceptance Criteria)

1. WHEN a Candidate provides valid email and password THEN THE System SHALL create a new user account with role 'candidate'
2. WHEN a user provides valid credentials THEN THE System SHALL return a JWT token for authentication
3. WHEN a user provides invalid credentials THEN THE System SHALL reject the login attempt and return an error message
4. WHEN an authenticated request is received THEN THE System SHALL validate the JWT token and extract user identity
5. WHERE Admin role is required THEN THE System SHALL verify the user has 'admin' role before granting access
6. WHEN a user attempts to register with an existing email THEN THE System SHALL reject the registration and return an error message

### 需求 2: 职位管理

**用户故事**: 作为管理员，我希望能够发布和管理职位信息，以便吸引合适的候选人申请。

#### 验收标准 (Acceptance Criteria)

1. WHERE Admin privileges exist THEN THE System SHALL allow creation of new Job entries with all required fields
2. WHEN a Job is created THEN THE System SHALL store title, department, location, type, salary_range, description, requirements, knowledge_base, and public_knowledge
3. WHEN retrieving active jobs THEN THE System SHALL return only jobs where is_active equals 1
4. WHERE Admin privileges exist THEN THE System SHALL allow updating existing Job information
5. WHERE Admin privileges exist THEN THE System SHALL allow deactivating jobs by setting is_active to 0
6. WHEN a Candidate requests job details THEN THE System SHALL return job information excluding internal knowledge_base

### 需求 3: 职位申请流程

**用户故事**: 作为求职者，我希望能够浏览职位并提交申请，以便参与面试流程。

#### 验收标准 (Acceptance Criteria)

1. WHEN a Candidate views the job board THEN THE System SHALL display all active jobs with public information
2. WHEN a Candidate submits an application THEN THE System SHALL create an Application record linking user_id and job_id
3. WHEN an Application is created THEN THE System SHALL set initial status to 'pending'
4. WHEN a Candidate uploads a resume file THEN THE System SHALL store the file and record the resume_path
5. WHEN a Candidate provides a GitHub link THEN THE System SHALL store the github_link in the Application
6. WHEN a Candidate views their applications THEN THE System SHALL return all Application records for that user with job details

### 需求 4: 简历解析与候选人画像

**用户故事**: 作为系统，我需要自动解析简历并生成候选人画像，以便为AI面试提供上下文信息。

#### 验收标准 (Acceptance Criteria)

1. WHEN a resume file is uploaded THEN THE System SHALL extract structured information including skills, experience, and education
2. WHEN resume parsing completes THEN THE System SHALL store the structured_resume as JSON in the Application record
3. WHEN generating a candidate profile THEN THE System SHALL combine resume data with GitHub information
4. WHEN profile generation completes THEN THE System SHALL store profile_data in the User record
5. IF resume parsing fails THEN THE System SHALL log the error and set structured_resume to null

### 需求 5: 实时视频面试 - WebSocket连接

**用户故事**: 作为候选人，我希望能够通过视频进行AI面试，以便展示我的能力和回答问题。

#### 验收标准 (Acceptance Criteria)

1. WHEN a Candidate initiates an interview THEN THE System SHALL establish a WebSocket_Connection for real-time communication
2. WHEN a WebSocket_Connection is established THEN THE System SHALL create a unique session_id and initialize session state to 'IDLE'
3. WHEN the connection is lost THEN THE System SHALL clean up session resources and close the Interview_Session
4. WHEN a START_INTERVIEW event is received THEN THE System SHALL transition session state to 'PROCESSING'
5. WHEN binary audio data is received THEN THE System SHALL append it to the session audio buffer
6. WHEN a USER_FINISHED_SPEAKING event is received THEN THE System SHALL process the accumulated audio buffer

### 需求 6: 实时视频面试 - 视觉监测

**用户故事**: 作为系统，我需要监测候选人的视觉行为，以便识别潜在的作弊或异常情况。

#### 验收标准 (Acceptance Criteria)

1. WHEN a VIDEO_FRAME event is received THEN THE Observer_Agent SHALL analyze the frame using MediaPipe
2. WHEN analyzing a frame THEN THE Observer_Agent SHALL detect whether a face is present
3. WHEN analyzing a frame THEN THE Observer_Agent SHALL estimate gaze direction
4. WHEN suspicious behavior is detected THEN THE Observer_Agent SHALL create a Risk_Log entry with timestamp and description
5. WHEN the AI requests visual context THEN THE System SHALL provide the latest Risk_Log entries
6. WHEN the interview ends THEN THE System SHALL store all Risk_Log entries in the InterviewRecord

### 需求 7: 实时视频面试 - 语音交互

**用户故事**: 作为候选人，我希望能够通过语音与AI面试官对话，以便进行自然的交流。

#### 验收标准 (Acceptance Criteria)

1. WHEN the interview starts THEN THE Coze_Service SHALL generate an introduction message
2. WHEN introduction text is generated THEN THE TTS_Service SHALL synthesize it into audio
3. WHEN audio synthesis completes THEN THE System SHALL send both text and audio to the Frontend
4. WHEN user audio is received THEN THE STT_Service SHALL transcribe it to text
5. WHEN transcription completes THEN THE System SHALL send the text to Coze_Service for response generation
6. WHEN Coze_Service returns a response THEN THE System SHALL synthesize it to audio and send to Frontend
7. WHEN the AI decides to end the interview THEN THE System SHALL send an INTERVIEW_END event

### 需求 8: AI对话编排

**用户故事**: 作为系统，我需要通过Coze服务编排面试对话逻辑，以便提供智能的面试体验。

#### 验收标准 (Acceptance Criteria)

1. WHEN starting an interview THEN THE Coze_Service SHALL receive candidate profile and job knowledge_base as context
2. WHEN processing user input THEN THE Coze_Service SHALL consider conversation history and Risk_Log data
3. WHEN generating a response THEN THE Coze_Service SHALL return structured JSON with reply text and action
4. WHEN the response action is 'END_INTERVIEW' THEN THE System SHALL terminate the Interview_Session
5. WHEN the response action is 'NEXT_QUESTION' THEN THE System SHALL continue the interview flow
6. IF Coze_Service returns plain text instead of JSON THEN THE System SHALL handle it gracefully and default action to 'NEXT_QUESTION'

### 需求 9: 面试记录与报告

**用户故事**: 作为管理员，我希望能够查看面试记录和AI生成的评估报告，以便做出招聘决策。

#### 验收标准 (Acceptance Criteria)

1. WHEN an interview starts THEN THE System SHALL create an InterviewRecord with start_time
2. WHEN the interview ends THEN THE System SHALL update the InterviewRecord with end_time
3. WHEN the interview ends THEN THE System SHALL store the complete transcript in the InterviewRecord
4. WHEN the interview ends THEN THE System SHALL store all Risk_Log entries in the InterviewRecord
5. WHERE Admin privileges exist THEN THE System SHALL allow retrieval of InterviewRecord data
6. WHEN generating a report THEN THE System SHALL analyze transcript and risk logs to produce evaluation metrics

### 需求 10: 通知系统

**用户故事**: 作为用户，我希望能够接收系统通知，以便及时了解申请状态变化和面试安排。

#### 验收标准 (Acceptance Criteria)

1. WHEN an Application status changes THEN THE System SHALL create a Notification for the Candidate
2. WHEN a Notification is created THEN THE System SHALL store title, message, type, and set is_read to 0
3. WHEN a user requests notifications THEN THE System SHALL return all Notification records for that user
4. WHEN a user marks a notification as read THEN THE System SHALL update is_read to 1
5. WHEN creating a notification THEN THE System SHALL set created_at to current timestamp

### 需求 11: 管理员候选人管理

**用户故事**: 作为管理员，我希望能够查看和管理所有候选人的申请，以便进行招聘流程管理。

#### 验收标准 (Acceptance Criteria)

1. WHERE Admin privileges exist THEN THE System SHALL provide an endpoint to retrieve all Application records
2. WHEN retrieving applications THEN THE System SHALL include Candidate information and Job details
3. WHERE Admin privileges exist THEN THE System SHALL allow updating Application status
4. WHEN Application status is updated to 'interviewing' THEN THE System SHALL create a notification for the Candidate
5. WHERE Admin privileges exist THEN THE System SHALL allow filtering applications by status or job_id

### 需求 12: 系统配置管理

**用户故事**: 作为管理员，我希望能够配置系统参数，以便自定义系统行为。

#### 验收标准 (Acceptance Criteria)

1. WHERE Admin privileges exist THEN THE System SHALL allow reading system configuration settings
2. WHERE Admin privileges exist THEN THE System SHALL allow updating system configuration settings
3. WHEN configuration is updated THEN THE System SHALL persist changes to the database
4. WHEN the system starts THEN THE System SHALL load configuration from the database
5. IF configuration is missing THEN THE System SHALL use default values

### 需求 13: 安全性与数据保护

**用户故事**: 作为系统管理员，我需要确保系统安全性，以便保护用户数据和防止未授权访问。

#### 验收标准 (Acceptance Criteria)

1. WHEN storing passwords THEN THE System SHALL hash them using a secure algorithm
2. WHEN generating JWT tokens THEN THE System SHALL use a strong SECRET_KEY
3. IF SECRET_KEY is not configured or uses default value THEN THE System SHALL log a critical warning
4. WHEN receiving requests THEN THE System SHALL validate CORS origins against ALLOWED_ORIGINS configuration
5. WHEN handling file uploads THEN THE System SHALL validate file types and sizes
6. WHEN an error occurs THEN THE System SHALL log the error without exposing sensitive information to the client

### 需求 14: 职位AI助手

**用户故事**: 作为候选人，我希望在查看职位详情时能够与AI助手对话，以便更好地了解职位信息。

#### 验收标准 (Acceptance Criteria)

1. WHEN a Candidate views a job detail page THEN THE System SHALL provide an AI chat interface
2. WHEN a Candidate asks a question about the job THEN THE System SHALL send the question to Coze_Service with job context
3. WHEN Coze_Service returns an answer THEN THE System SHALL display it in the chat interface
4. WHEN generating answers THEN THE Coze_Service SHALL use the job's public_knowledge as context
5. WHEN the chat session ends THEN THE System SHALL not persist the conversation history

