import pandas as pd
import pika
import json
import time
from datetime import datetime, timedelta


def read_csv(file_path):
    df = pd.read_csv(file_path)
    return list(df.iloc[:, 0].to_dict().values()) , list(df.iloc[:, 1].to_dict().values())

def send_to_mq(queue_name, message):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=False)
    channel.basic_publish(exchange='', routing_key=queue_name, body=message)
    connection.close()

def main():
    csv_file_path = 'TS5_chopped.csv'
    queue_name = 'levels_data'  
    elapsed_times, data_values = read_csv(csv_file_path)
    times = elapsed_times[:100]
    values = data_values[:100]

    for elapsed_time, value in zip(times, values):

        message = json.dumps({
            'time': elapsed_time,
            'levels': value
        })

        send_to_mq(queue_name, message)
        print(f"Sent: {message}")

        time.sleep(0.2)

if __name__ == "__main__":
    main()
