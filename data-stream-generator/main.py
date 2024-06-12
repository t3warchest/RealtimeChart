import csv
import random
from datetime import datetime, timedelta

def main():
    interval_minutes = 30

    interval = timedelta(minutes=interval_minutes)
    print(interval)
    
    filename = "steps_record.csv"

    fields = ['time', 'steps']

    with open(filename, 'a', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()  # Write header only if the file is empty

        current_time = datetime.now()
        
        no_of_rows = 0
        while no_of_rows <= 1000:
            time = current_time.strftime("%Y-%m-%d %H:%M:%S")
            steps = random.randint(0, 100)
            row = {'time': time, 'steps': steps}

            writer.writerow(row)  # Write row directly without opening file again

            current_time += interval
            no_of_rows += 1
            print(current_time)


    


if __name__ == "__main__":
    main()
