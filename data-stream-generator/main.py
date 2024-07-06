import pandas as pd
import pika
import json
import time
import redis
import threading
import datetime 

redis_client = redis.Redis(
  host='redis-11660.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
  port=11660,
  password='YiDuWXnAVoXV3YoXD7OiWkCbTVrAOZst')

redis_time_series_client = redis_client.ts()

# redis_time_series_client.create("patient_1_data")


def read_csv(file_path):
    df = pd.read_csv(file_path)
    return list(df.iloc[:, 0].to_dict().values()), list(df.iloc[:, 1].to_dict().values())

def send_to_mq(queue_name, message):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=False)
    channel.basic_publish(exchange='', routing_key=queue_name, body=message)
    connection.close()

def start_publishing():
    csv_file_path = 'data_1.csv'
    queue_name = 'levels_data'
    elapsed_times, data_values = read_csv(csv_file_path)
    times = elapsed_times#[:50]
    values = data_values#[:50]
    
    current_time = datetime.datetime.now()
    intitalValues = json.dumps({
        'time':current_time.isoformat(),
        'levels':0
    })
    send_to_mq(queue_name,intitalValues)
    
    current_time_timestamp = int(current_time.timestamp() * 1000)
    
    patientId = "p001"
    sessionId = f"session:{current_time_timestamp}"
    sessionKey = f"patients:{patientId}:{sessionId}"
    redis_time_series_client.create(sessionKey)

    for elapsed_time, value in zip(times, values):
        if redis_client.get('start-stop-notifier').decode('utf-8') == 'stop':
            print("Publishing stopped.")
            break
        
        timeValue = (current_time + datetime.timedelta(seconds=elapsed_time))
        timeStoringFormat = timeValue.isoformat()
        message = json.dumps({
            'time': timeStoringFormat,
            'levels': value
        })
        
        timestamp_ms = int(timeValue.timestamp() * 1000)

        send_to_mq(queue_name, message)
        
        redis_time_series_client.add(sessionKey,timestamp_ms,value)
        
        print(f"Sent: {message}")

        time.sleep(0.25)
        
    send_to_mq(queue_name, "end")
    
    sessionSetsKey = f"patients:{patientId}:sessions"
    redis_client.zadd(sessionSetsKey,{sessionId:current_time_timestamp})
    
    session_count = redis_client.zcard(sessionSetsKey)
    if session_count > 3:
        oldest_session_id = redis_client.zrange(sessionSetsKey, 0, 0)[0].decode('utf-8')
        redis_client.zrem(sessionSetsKey,oldest_session_id)
        
        oldest_session = f"patients:{patientId}:{oldest_session_id}"
        redis_client.delete(oldest_session)


if __name__ == "__main__":
    previous_state = None
    while True:
        current_state = redis_client.get('start-stop-notifier').decode('utf-8')
        if current_state != previous_state:
            previous_state = current_state
            if current_state == 'start':
                print("publishing...")
                start_publishing()
            elif current_state == 'stop':
                print("not publishing")
        
        time.sleep(1)  
    
