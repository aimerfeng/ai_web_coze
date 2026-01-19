# 04. 数据库结构说明 (Database Schema)

目前项目使用 **SQLite** 数据库，通过 **SQLAlchemy** 定义模型。

## 1. 用户表 (`users`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Integer (PK) | 用户唯一标识 |
| `email` | String | 登录邮箱 (Unique) |
| `hashed_password`| String | 加密后的密码 |
| `full_name` | String | 用户全名 |
| `role` | String | 角色权限: `candidate` (求职者) 或 `admin` (管理员) |

## 2. 职位表 (`jobs`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Integer (PK) | 职位 ID |
| `title` | String | 职位名称 (如: "高级 Python 工程师") |
| `department` | String | 部门 |
| `location` | String | 工作地点 |
| `type` | String | 职位类型 (全职/兼职/外包/实习) |
| `salary_range` | String | 薪资范围 |
| `description` | Text | 职位描述 (JD) |
| `requirements` | Text | 任职要求 |
| `knowledge_base` | Text | **内部知识库** (仅供 AI 面试官参考，不对外) |
| `public_knowledge`| Text | **公开知识库** (显示在前端职位卡片，吸引候选人) |
| `is_active` | Integer | 状态 (1=招聘中, 0=已关闭) |

## 3. 申请记录表 (`applications`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Integer (PK) | 申请 ID |
| `user_id` | Integer (FK) | 关联 `users.id` |
| `job_id` | Integer (FK) | 关联 `jobs.id` |
| `status` | String | 状态 (`pending`, `interviewing`, `review`, `offered`) |
| `github_link` | String | 候选人提交的代码库链接 |
| `resume_path` | String | 简历文件存储路径 |
| `created_at` | DateTime | 申请时间 |

## 4. 关系图示 (ER Diagram Logic)
```
[User] 1 ---- * [Application] * ---- 1 [Job]
```
*   一个用户可以申请多个职位。
*   一个职位可以被多个用户申请。
*   `Application` 是连接表，存储了这次申请的具体状态和资料。

## 5. 潜在扩展 (Future Schema)
为了支持更复杂的管理员功能，建议未来添加：
*   `Interviews`: 存储具体的面试会话记录、视频回放地址、AI 评分报告。
*   `Settings`: 存储系统全局配置。
