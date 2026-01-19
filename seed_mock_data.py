import sqlite3
import random
from datetime import datetime, timedelta

# --- MOCK DATA GENERATOR ---
# This script populates the database with sample data for demonstration purposes.
# In a real production environment, this should be removed or disabled.

def seed_data():
    db_path = "sql_app.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Seeding mock data...")

    # 1. Clear existing jobs (Optional, but keeps it clean for demo)
    # cursor.execute("DELETE FROM jobs") 
    
    # 2. Mock Jobs
    jobs = [
        ("高级 Python 后端工程师", "研发部", "全职", "北京", "35k-55k", "负责核心业务系统的后端架构设计与开发...", "精通 Python, FastAPI, K8s..."),
        ("React 前端开发专家", "用户体验部", "全职", "上海", "30k-50k", "打造极致流畅的 Web 交互体验...", "精通 React, Tailwind, Three.js..."),
        ("AI 算法实习生", "AI Lab", "实习", "远程", "300-500/天", "参与大模型微调与 RAG 系统优化...", "熟悉 PyTorch, Transformer..."),
        ("产品经理 (B端)", "产品部", "全职", "深圳", "25k-40k", "负责企业级招聘系统的产品规划...", "具备 SaaS 产品经验..."),
        ("UI/UX 设计师", "设计部", "外包", "成都", "15k-25k", "负责移动端与 Web 端界面设计...", "精通 Figma, Sketch..."),
        ("DevOps 工程师", "运维部", "全职", "北京", "30k-45k", "负责 CI/CD 流水线搭建与维护...", "熟悉 Jenkins, Docker..."),
        ("测试开发工程师", "质量部", "全职", "杭州", "20k-35k", "负责自动化测试平台开发...", "熟悉 Selenium, PyTest..."),
        ("人力资源专员", "HR部", "全职", "广州", "10k-18k", "负责员工入职离职手续办理...", "熟悉劳动法..."),
        ("财务会计", "财务部", "兼职", "北京", "200/时", "协助处理税务申报...", "持会计证..."),
        ("市场营销经理", "市场部", "全职", "上海", "25k-45k", "负责品牌推广与活动策划...", "具备 4A 广告公司经验..."),
    ]

    for job in jobs:
        # Check if exists to avoid dupes
        cursor.execute("SELECT id FROM jobs WHERE title = ?", (job[0],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO jobs (title, department, location, type, salary_range, description, requirements, knowledge_base, public_knowledge, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                job[0], 
                job[1], # department
                job[3], # location (swapped in list index, fix below)
                job[2], # type
                job[4], # salary
                job[5], # desc
                job[6], # req
                "内部知识库：此岗位为核心岗位，面试重点考察系统设计能力...", # internal KB
                "福利：六险一金，每年两次调薪，免费三餐..." # public KB
            ))

    # 3. Mock Applications (Candidates)
    # We need user IDs first. Let's assume we have some users or create dummy ones if needed.
    # For this demo, we'll just create some dummy application records linked to user_id=1 (test user) for visibility
    # In a real scenario, we'd create distinct users.
    
    statuses = ['pending', 'interviewing', 'review', 'offered', 'rejected']
    
    # Get all job IDs
    cursor.execute("SELECT id FROM jobs")
    job_ids = [row[0] for row in cursor.fetchall()]

    if job_ids:
        # Create mock applications for the test user
        test_user_id = 1 # Assuming test@example.com is ID 1
        
        for i in range(5):
            job_id = random.choice(job_ids)
            status = random.choice(statuses)
            applied_at = datetime.now() - timedelta(days=random.randint(1, 30))
            
            # Check exist
            cursor.execute("SELECT id FROM applications WHERE user_id = ? AND job_id = ?", (test_user_id, job_id))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO applications (user_id, job_id, status, github_link, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (test_user_id, job_id, status, f"https://github.com/candidate{i}", applied_at))

    conn.commit()
    conn.close()
    print("Mock data seeded successfully!")

if __name__ == "__main__":
    seed_data()
