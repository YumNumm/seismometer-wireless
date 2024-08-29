# seismometer-wireless (Working in progress)

複数の震度計(ボード)上で動作するファームウェアです。

Forked from [ingen084/seismometer](https://github.com/ingen084/seismometer)

## 特徴

- 高速な処理による 100Hz でのサンプリング
- 正確なアルゴリズムによる震度算出
  - 処理の最適化により、PiDASPlusでは不可能だった過去60秒を元にした算出が可能です
  - 気象庁の検定は受けていないため、計測震度相当となります。
- シリアル経由での算出値の出力
  - 今のところ NMEA フォーマット をサポートしています

## 安定状態について

計測震度(相当)を算出するためには最低 60 秒間の観測が必要です。
起動時操作などで機器が揺れていることも想定し、最低起動後 60 秒間経過するまでと過去 60 秒間の計測震度が安定するまでは計測震度を `nan` として出力します。
いつまで経っても安定状態にならず震度が出力されない場合は作者までお知らせください。

## 対応ボード

- [PiDAS](https://nrck.github.io/PiDAS/)
  - デフォルト構成(Raspberry Pi Pico)
  - (仮対応)Raspberry Pi Pico W
    - Wi-Fi 接続による観測値の送信には未対応です。
- [EQIS-1](https://quake.one/sense/)
  - Seeed Studio XIAO RP2040
  - (仮対応)Seeed Studio XIAO ESP32C3 / ESP32S3
    - USBシリアル切断後、数秒するとリセットされる問題があります
    - Wi-Fi 接続による観測値の送信には未対応です。
      - 今後対応予定ですが、性能的に ESP32C3 は対応できない可能性が高いため ESP32S3 の利用をお勧めします。

## ディスプレイ表示

### PiDAS

電源に接続すると、安定状態の確認が開始され震度 0 ~ 7 のLEDが1つずつ点灯するアニメーションが再生されます。
安定状態になると、震度に応じたLEDが点灯し、過去10分の最大震度のLEDが点滅します。

### EQIS-1

電源に接続すると、安定状態の確認が開始され `Stationary checking...` という文字が表示されます。(英単語に自信がないので間違ってたら指摘ください…)
OLED の寿命を考慮し、安定状態になると表示は消えます。
揺れがあると OLED が点灯し、上部に震度が、右下に小さく計測震度が表示されます。
過去10分の最大震度が更新されると、現在の震度の表示状況にかかわらず画面下部に `Max: 震度` が表示されます。

まだまだ微妙な感じがしているので、アイデアをお待ちしております…。

## シリアル通信

USBシリアルを使用したデータの転送に対応しており、PC などへのデータの提供が可能です。
ボーレートは 115200 です。

### NMEA 出力フォーマット

PiDASPlus に存在している **`XSPGA`/`XSOFF` は実装されていません。**

#### `XSACC` 加速度(gal)

1秒間に100回出力します。HPF による重力成分などのフィルタ後の値です。
`$XSACC,X軸の加速度,Y軸の加速度,Z軸の加速度*チェックサム`

#### `XSRAW` 加速度センサー生データ

1秒間に100回出力します。
`$XSRAW,X軸の生の値,Y軸の生の値,Z軸の生の値*チェックサム`

#### `XSINT` 計測震度(相当)

1秒間に**5**回出力します。気象庁の検定に合格していない場合は計測震度(相当)となりますので注意してください。
`$XSINT,-1.0,計測震度*チェックサム`

**機器が安定状態になっていない場合は計測震度は `nan` になります。**
**フィルタ後の加速度部分は出力する意味がないため `-1.0` 固定です。**

#### `XSHWI` ハードウェア情報

コマンド受信時に1回出力します。
`$XSHWI,情報バージョン,ファームウェア+バージョン,ハード名,センサー名,ADC名,生データステップ(gal)*チェックサム`

今のところ以下の設定で出力されます。
処理を作成する場合、**非対応の情報バージョンは無視するようにしてください**。

情報バージョン: `1`
ファームウェア+バージョン: `ingen-seismometer;x.x.x`

| ボード名       | センサー名 | ADC名   | 生データ1あたりの gal |
| -------------- | ---------- | ------- | -------- |
| EQIS-1;ESP32S3 | LSM6DSO    |         | 0.059820 |

#### `XSERR` エラー

内部でエラーが発生した場合に出力します。
`$XSERR,エラーID*チェックサム`

| エラーID | エラー内容 |
| --- | --- |
| `MEASURE_DROPPED` | 計測が100Hzで行えなかった |

### 入力フォーマット

CR(\r) もしくは LF(\n) で終わる文字列を受信します。

#### `HWINFO`

ハード情報(`XSHWI`)を出力します。

## 特許について

計測震度を算出するためのフィルタを、[特許第5946067号](https://plidb.inpit.go.jp/pldb/html/HTML.L/2016/001/L2016001200.html) の文書を元に実装しています。
非営利目的として個人で利用する分には問題ありませんが、この処理を使用して利益を得る場合、防災科研とのライセンス契約が必要です。
