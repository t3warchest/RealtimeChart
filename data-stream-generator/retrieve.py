import asyncio
import redis
from bleak import BleakClient
import struct
import pandas as pd
import os
from datetime import datetime

r = redis.Redis(host ="redis-18767.c256.us-east-1-2.ec2.cloud.redislabs.com", port=18767, password="SLsgmhbCWdTEAayNm0maDibnYBfwO3Xf")
# print(r.ping())
# exit(1)

DEVICE_MAC = "5053D0BA-F5DF-3F22-94BF-981C9DF9C9CF"  
CHARACTERISTIC_UUID = "00002201-D578-4741-9B5B-7C64E958CFC6"  

session_data = []



def notification_handler(sender: int, data: bytearray):
    if len(data) != 17:
        print(f"Unexpected data length from {sender}: {data}")
        return
    
    # Unpack data based on provided structure
    print(data)
    MuscleTSI, O2HB, HHb, MState, QualityFlag = struct.unpack('<fffBI', data)
    session_data.append(round(MuscleTSI,2))
    r.lpush("mylist",round(MuscleTSI,3))

    print(f"Received data from {sender}:")
    print(f"MuscleTSI: {MuscleTSI}")
    print(f"O2HB: {O2HB}")
    print(f"HHb: {HHb}")
    print(f"MState: {MState}")
    print(f"Quality Flag: {QualityFlag}")

    session_data.append(round(MuscleTSI,2))

async def retrieve_data(redis_instance):
    async with BleakClient(DEVICE_MAC) as client:
        if not await client.is_connected():
            print("Failed to connect!")
            return

        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)

        # Loop to periodically check the Redis flag
        while True:
            stop_retrieval = redis_instance.get("stop_data_retrieval")
            if stop_retrieval and stop_retrieval.decode() == "True":
                await client.stop_notify(CHARACTERISTIC_UUID)
                break

            await asyncio.sleep(3)  # Sleep for a short time before checking again

        # Reset the flag in Redis
        redis_instance.set("stop_data_retrieval", "False")


from datetime import datetime

def create_and_save_incremented_dataframe_local(number_list, download_path):
    # Expand the tilde to the user's home directory
    download_path = os.path.expanduser(download_path)

    upperlimit = 60
    lowerlimit = 45
    slow, fast, zone, timespent, maxtsi, mintsi = 0, 0, 0, 0, 0, 0

    # Get current date and time for filename
    current_datetime = datetime.now().strftime("%A, %B %d, %Y %I:%M:%S %p")
    filename = f'{current_datetime}.csv'
    full_path = os.path.join(download_path, filename)

    # Create a DataFrame and save it to CSV
    df = pd.DataFrame({
        'Time': range(1, len(number_list) + 1),
        'TSI': number_list
    })

    print(df)

    fast = (df[df['TSI'] < lowerlimit].shape[0])/20
    slow = (df[df['TSI'] > upperlimit].shape[0])/20
    zone = (df[(df['TSI'] > 45) & (df['TSI'] < 60)].shape[0])/20
    timespent = round(df.shape[0] / 20, 1)
    maxtsi = df['TSI'].max()
    mintsi = df['TSI'].min()

    df.to_csv(full_path, index=False)

    return [slow, fast, zone, timespent, maxtsi, mintsi]


"""async def retrieve_data():
    async with BleakClient(DEVICE_MAC) as client:
        
        if not await client.is_connected():
            print("Failed to connect!")
            return

        
        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)
        await asyncio.sleep(90)  
        await client.stop_notify(CHARACTERISTIC_UUID)"""



'''def create_and_save_incremented_dataframe_local(number_list, download_path):
    # Expand the tilde to the user's home directory
    download_path = os.path.expanduser(download_path)


    upperlimit = 60
    lowerlimit = 45
    slow,fast,zone,timespent = 0,0,0,0
    maxtsi,mintsi = 0,0

    # File to store the last used number
    number_storage_file = os.path.join(download_path, 'last_used_number.txt')

    # Check if the number storage file exists and read the last used number
    if os.path.exists(number_storage_file):
        with open(number_storage_file, 'r') as file:
            file_number = int(file.read().strip()) + 1
    else:
        file_number = 1

    # Filename with incremented number
    filename = f'M{file_number:03}.csv'
    full_path = os.path.join(download_path, filename)

    # Create a DataFrame and save it to CSV
    df = pd.DataFrame({
        'Time': range(1, len(number_list) + 1),
        'TSI': number_list
    })

    print(df)

    fast = df[df['TSI'] < lowerlimit].shape[0]
    slow = df[df['TSI'] > upperlimit].shape[0]
    zone = df[(df['TSI'] > 45) & (df['TSI'] < 60)].shape[0]
    timespent = round(df.shape[0] / 5,1)
    maxtsi = df['TSI'].max()
    mintsi = df['TSI'].min()





    df.to_csv(full_path, index=False)

    # Update the number storage file with the new number
    with open(number_storage_file, 'w') as file:
        file.write(str(file_number))

    return [slow,fast,zone,timespent,maxtsi,mintsi]'''


def shift_lists_in_redis(redis_client, new_list_string, new_meta_string):
    # Retrieve existing data from Redis
    existing_list1 = redis_client.get("List1")
    existing_list2 = redis_client.get("List2")

    existing_meta1 = redis_client.get("Meta1")
    existing_meta2 = redis_client.get("Meta2")


    # Update "List3" with the data from "List2"
    if existing_list2 is not None:
        redis_client.set("List3", existing_list2)

    if existing_meta2 is not None:
        redis_client.set("Meta3", existing_meta2)

    # Update "List2" with the data from "List1"
    if existing_list1 is not None:
        redis_client.set("List2", existing_list1)

    if existing_meta1 is not None:
        redis_client.set("Meta2", existing_meta1)

    # Update "List1" with the new data
    redis_client.set("List1", new_list_string)
    redis_client.set("Meta1", new_meta_string)







asyncio.run(retrieve_data(r))
print("Connecting Redis")
session_string = str(session_data)


# r.lpush("session_list",session_string)
# Example usage

download_path = '~/Downloads'  # Replace with your downloads folder path if different
csv_meta = str(create_and_save_incremented_dataframe_local(session_data, download_path))
print(csv_meta)


shift_lists_in_redis(r, session_string, csv_meta)
print("Data updated in Redis")



