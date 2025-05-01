# location_navigation.jsonの書き方

```json
[
  {
    "id": "lc1",
    "location": "2ndFloorEntrance",
    "name": "正面玄関",
    "building_name": "工学部3号館",
    "floor_number": 2,
    "panorama_image": "2ndFloorEntrance.jpg",
    "connections": [
      {
        "target_location": "2ndFloorSE",
        "direction_name": "廊下を右に進む",
        "position_percent": 75,
        "distance_meters": 15
      },
      {
        "target_location": "2ndFloorSEstair",
        "direction_name": "階段を上がる",
        "position_percent": 45,
        "distance_meters": 5
      }
    ]
  },
  {
    "id": "lc2",
    "location": "2ndFloorSE",
    "name": "曲がり角",
    "building_name": "工学部3号館",
    "floor_number": 2,
    "panorama_image": "2ndFloorSE.jpg",
    "connections": [
      {
        "target_location": "2ndFloorEntrance",
        "direction_name": "正面玄関に戻る",
        "position_percent": 25,
        "distance_meters": 15
      },
      {
        "target_location": "2ndFloorE",
        "direction_name": "廊下を直進",
        "position_percent": 55, 
        "distance_meters": 10
      },
      {
        "target_location": "217",
        "direction_name": "演習室3に入る",
        "position_percent": 85,
        "distance_meters": 2
      }
    ]
  },
  {
    "id": "room1",
    "location": "217",
    "name": "演習室3",
    "room_number": 217,
    "building_name": "工学部3号館",
    "floor_number": 2,
    "panorama_image": "room217.jpg",
    "connections": [
      {
        "target_location": "2ndFloorSE",
        "direction_name": "教室を出る",
        "position_percent": 10,
        "distance_meters": 2
      }
    ]
  },
  {
    "id": "lc10",
    "location": "2ndFloorSEstair",
    "name": "階段",
    "building_name": "工学部3号館",
    "floor_number": 2,
    "panorama_image": "2ndFloorSEstair.jpg",
    "connections": [
      {
        "target_location": "2ndFloorEntrance",
        "direction_name": "階段を下りる",
        "position_percent": 30,
        "distance_meters": 5
      },
      {
        "target_location": "3rdFloorRounge",
        "direction_name": "階段を上がる",
        "position_percent": 60,
        "distance_meters": 10
      }
    ]
  }
]
```
解説
基本情報: 現在のlocation.jsonの情報を継承しつつ、必要な情報を追加している。
パノラマ画像: 各locationに対応するパノラマ画像のファイル名を指定している（panorama_imageフィールド）。これらの画像はfrontend/public/location/に保存されることを前提としている。

ーーーー

接続情報（connections配列）:

target_location: 接続先のlocation識別子

(direction_name: ユーザーへの方向案内テキスト)←いる？

position_percent: パノラマ画像の左端から何%の位置に接続先への方向があるか（これによりUI上で方向を示すマーカーを配置できる）

distance_meters: 概算の距離（メートル）- オプションだが、ユーザーに距離感を伝えるのに役立つ


ーーーー

拡張性

各locationからの接続先（分岐）は配列で表現されているため、分岐は何個でも設定できる

ーーーー

双方向の接続:

双方向の接続に関しては別々に定義しなければならない。



