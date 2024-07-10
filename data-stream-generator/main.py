import pandas as pd
import pika
import json
import time
import redis
import threading
import datetime 
from bleak import BleakClient
import struct
import asyncio

DEVICE_MAC = "5053D0BA-F5DF-3F22-94BF-981C9DF9C9CF"
CHARACTERISTIC_UUID = "00002201-D578-4741-9B5B-7C64E958CFC6"

redis_client = redis.Redis(
  host='redis-11660.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
  port=11660,
  password='YiDuWXnAVoXV3YoXD7OiWkCbTVrAOZst')

redis_time_series_client = redis_client.ts()

channel = 'levels_data'


# redis_time_series_client.create("patient_1_data")


# def read_csv(file_path):
#     df = pd.read_csv(file_path)
#     return list(df.iloc[:, 0].to_dict().values()), list(df.iloc[:, 1].to_dict().values())

# def send_to_mq(queue_name, message):
#     connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
#     channel = connection.channel()
#     channel.queue_declare(queue=queue_name, durable=False)
#     channel.basic_publish(exchange='', routing_key=queue_name, body=message)
#     connection.close()

# session_data = []

# Notification handler for BLE device
def notification_handler(sender: int, data: bytearray, sessionKey:str):
    if len(data) != 17:
        print(f"Unexpected data length from {sender}: {data}")
        return

    # Unpack data based on provided structure
    MuscleTSI, O2HB, HHb, MState, QualityFlag = struct.unpack('<fffBI', data)
    # session_data.append(round(MuscleTSI, 2))
    
    timestamp = int(datetime.datetime.now().timestamp() * 1000)
    
    message = json.dumps({
        'time':datetime.datetime.now().isoformat(),
        'levels':round(MuscleTSI,2)
    })
    
    redis_client.publish(channel, message)
    
    redis_time_series_client.add(sessionKey,timestamp,round(MuscleTSI,2))
    # r.lpush("mylist", round(MuscleTSI, 3))
    
    print(f"Received data from {sender}:")
    print(f"MuscleTSI: {MuscleTSI}")
    print(f"O2HB: {O2HB}")
    print(f"HHb: {HHb}")
    print(f"MState: {MState}")
    print(f"Quality Flag: {QualityFlag}")

    # session_data.append(round(MuscleTSI, 2))
    
    
async def retrieve_data(redis_instance):
    async with BleakClient(DEVICE_MAC) as client:
        if not await client.is_connected():
            print("Failed to connect!")
            return
        
        current_time_timestamp = int(datetime.datetime.now().timestamp * 1000)
        patientId = "p001"
        sessionId = f"session:{current_time_timestamp}"
        sessionKey = f"patients:{patientId}:{sessionId}"
        
        redis_time_series_client.create(sessionKey)

        await client.start_notify(CHARACTERISTIC_UUID,  lambda sender, data: notification_handler(sender, data, sessionKey))

        # Loop to periodically check the Redis flag
        while True:
            stop_retrieval = redis_instance.get("start-stop-notifier")
            if stop_retrieval and stop_retrieval.decode() == "stop":
                await client.stop_notify(CHARACTERISTIC_UUID)
                break

            await time.sleep(3)  # Sleep for a short time before checking again
    
            redis_client.publish(channel, 'end')
    
        sessionSetsKey = f"patients:{patientId}:sessions"
        redis_client.zadd(sessionSetsKey,{sessionId:current_time_timestamp})
        
        session_count = redis_client.zcard(sessionSetsKey)
        if session_count > 3:
            oldest_session_id = redis_client.zrange(sessionSetsKey, 0, 0)[0].decode('utf-8')
            redis_client.zrem(sessionSetsKey,oldest_session_id)
            
            oldest_session = f"patients:{patientId}:{oldest_session_id}"
            redis_client.delete(oldest_session)

        # Reset the flag in Redis
        # redis_instance.set("start-stop-notifier", "stop")

# def send_to_redis(channel, message):
    

# def start_publishing():
#     channel = "levels_data"
#     current_time = datetime.datetime.now()
#     initialValues = json.dumps({
#         'time':current_time.isoformat(),
#         'levels':0
#     })
#     # send_to_mq(queue_name,intitalValues)
#     send_to_redis(channel, initialValues)
    
#     current_time_timestamp = int(current_time.timestamp() * 1000)
    
#     patientId = "p001"
#     sessionId = f"session:{current_time_timestamp}"
#     sessionKey = f"patients:{patientId}:{sessionId}"
    

#     for elapsed_time, value in enumerate(session_data):
#         # if redis_client.get('start-stop-notifier').decode('utf-8') == 'stop':
#         #     print("Publishing stopped.")
#         #     break
        
#         timeValue = (current_time + datetime.timedelta(seconds=elapsed_time))
#         timeStoringFormat = timeValue.isoformat()
#         message = json.dumps({
#             'time': timeStoringFormat,
#             'levels': value
#         })
        
#         timestamp_ms = int(timeValue.timestamp() * 1000)

#         # send_to_mq(queue_name, message)
#         send_to_redis(channel,message)
        
#         redis_time_series_client.add(sessionKey,timestamp_ms,value)
        
#         print(f"Sent: {message}")

#         time.sleep(0.1)
        
#     # send_to_mq(queue_name, "end")
#     send_to_redis(channel, "end")
    
#     sessionSetsKey = f"patients:{patientId}:sessions"
#     redis_client.zadd(sessionSetsKey,{sessionId:current_time_timestamp})
    
#     session_count = redis_client.zcard(sessionSetsKey)
#     if session_count > 3:
#         oldest_session_id = redis_client.zrange(sessionSetsKey, 0, 0)[0].decode('utf-8')
#         redis_client.zrem(sessionSetsKey,oldest_session_id)
        
#         oldest_session = f"patients:{patientId}:{oldest_session_id}"
#         redis_client.delete(oldest_session)


if __name__ == "__main__":
    previous_state = None
    while True:
        current_state = redis_client.get('start-stop-notifier').decode('utf-8')
        if current_state != previous_state:
            previous_state = current_state
            if current_state == 'start':
                print("publishing...")
                asyncio.run(retrieve_data(redis_client))
            elif current_state == 'stop':
                print("not publishing")
        
        time.sleep(1)  
    
# import pandas as pd
# import pika
# import json
# import time
# import redis
# import threading
# import datetime 

# redis_client = redis.Redis(
#   host='redis-11660.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
#   port=11660,
#   password='YiDuWXnAVoXV3YoXD7OiWkCbTVrAOZst')

# redis_time_series_client = redis_client.ts()

# # redis_time_series_client.create("patient_1_data")


# def read_csv(file_path):
#     df = pd.read_csv(file_path)
#     return list(df.iloc[:, 0].to_dict().values()), list(df.iloc[:, 1].to_dict().values())

# # def send_to_mq(queue_name, message):
# #     connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
# #     channel = connection.channel()
# #     channel.queue_declare(queue=queue_name, durable=False)
# #     channel.basic_publish(exchange='', routing_key=queue_name, body=message)
# #     connection.close()
# def send_to_redis(channel, message):
#     redis_client.publish(channel, message)

# def start_publishing():
#     csv_file_path = 'data_2.csv'
#     channel = 'levels_data'
#     elapsed_times, data_values = read_csv(csv_file_path)
#     times = elapsed_times#[:50]
#     values = data_values#[:50]
    
#     current_time = datetime.datetime.now()
#     initialValues = json.dumps({
#         'time':current_time.isoformat(),
#         'levels':0
#     })
#     # send_to_mq(queue_name,intitalValues)
#     send_to_redis(channel, initialValues)
    
#     current_time_timestamp = int(current_time.timestamp() * 1000)
    
#     patientId = "p001"
#     sessionId = f"session:{current_time_timestamp}"
#     sessionKey = f"patients:{patientId}:{sessionId}"
#     redis_time_series_client.create(sessionKey)

#     for elapsed_time, value in zip(times, values):
#         if redis_client.get('start-stop-notifier').decode('utf-8') == 'stop':
#             print("Publishing stopped.")
#             break
        
#         timeValue = (current_time + datetime.timedelta(seconds=elapsed_time))
#         timeStoringFormat = timeValue.isoformat()
#         message = json.dumps({
#             'time': timeStoringFormat,
#             'levels': value
#         })
        
#         timestamp_ms = int(timeValue.timestamp() * 1000)

#         # send_to_mq(queue_name, message)
#         send_to_redis(channel,message)
        
#         redis_time_series_client.add(sessionKey,timestamp_ms,value)
        
#         print(f"Sent: {message}")

#         time.sleep(0.1)
        
#     # send_to_mq(queue_name, "end")
#     send_to_redis(channel, "end")
    
#     sessionSetsKey = f"patients:{patientId}:sessions"
#     redis_client.zadd(sessionSetsKey,{sessionId:current_time_timestamp})
    
#     session_count = redis_client.zcard(sessionSetsKey)
#     if session_count > 3:
#         oldest_session_id = redis_client.zrange(sessionSetsKey, 0, 0)[0].decode('utf-8')
#         redis_client.zrem(sessionSetsKey,oldest_session_id)
        
#         oldest_session = f"patients:{patientId}:{oldest_session_id}"
#         redis_client.delete(oldest_session)


# if __name__ == "__main__":
#     previous_state = None
#     while True:
#         current_state = redis_client.get('start-stop-notifier').decode('utf-8')
#         if current_state != previous_state:
#             previous_state = current_state
#             if current_state == 'start':
#                 print("publishing...")
#                 start_publishing()
#             elif current_state == 'stop':
#                 print("not publishing")
        
#         time.sleep(1)  
    