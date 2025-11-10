from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from zoneinfo import ZoneInfo
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run_multiple_puzzles import save_multiple_puzzles

eastern = ZoneInfo('America/New_York')
scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', hour=0, minute=0, timezone=eastern)
def generate_daily_puzzle_job():
    print(f"\n{'='*60}")
    print(f"Running daily puzzle generation...")
    print(f"Time: {datetime.now(eastern).strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"{'='*60}\n")
    
    try:
        save_multiple_puzzles(num_rounds=20)
        print(f"\n{'='*60}")
        print(f"✓ Daily puzzle generated successfully!")
        print(f"{'='*60}\n")
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"✗ Error generating puzzle: {e}")
        print(f"{'='*60}\n")

print("\n" + "="*60)
print("DAILY PUZZLE SCHEDULER STARTED")
print("="*60)
print(f"Current time (Eastern): {datetime.now(eastern).strftime('%Y-%m-%d %H:%M:%S %Z')}")
print(f"Scheduled to run: Every day at midnight Eastern Time")
print("="*60 + "\n")

scheduler.print_jobs()

# Optional startup run (use CLI arg)
if '--now' in sys.argv:
    generate_daily_puzzle_job()

try:
    scheduler.start()
except (KeyboardInterrupt, SystemExit):
    print("\n" + "="*60)
    print("Scheduler stopped.")
    print("="*60)
