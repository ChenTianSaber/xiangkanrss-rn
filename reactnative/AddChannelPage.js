/**
 * 订阅源内容列表
 */
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Colors } from 'react-native-ui-lib'
import { TextField } from 'react-native-ui-lib/src/incubator'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as rssParser from 'react-native-rss-parser'
import Realm from "realm"
import { ChannelScheme, RSSItemScheme } from './DataBase'
import RNFetchBlob from "rn-fetch-blob"

var Cheerio = require('cheerio')

/**
 * 订阅源链接输入框
 */
const UrlEditTxt = (props) => {

    const [url, setUrl] = useState('')

    useEffect(() => {
        props.onRef(this)
    })

    getUrl = () => {
        return url
    }

    return (
        <TextField
            placeholder={'请输入订阅源url'}
            floatingPlaceholder={true}
            onChangeText={(text) => setUrl(text)}
            showCharCounter={false}
            floatOnFocus={false}
            containerStyle={{ marginTop: 16 }}
            fieldStyle={{ backgroundColor: 'white', fontSize: 14, padding: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8 }}
            floatingPlaceholderColor={Colors.grey30}
            floatingPlaceholderStyle={{ height: 42, fontSize: 14 }}
            color={{ color: Colors.grey1 }}
            label={url}
        />
    )
}

const SearchView = (props) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2', padding: 16 }}>
            <UrlEditTxt onRef={(ref) => (this.editText = ref)} />
            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                // 获取链接
                let url = this.editText.getUrl()
                // 请求链接
                fetch(url)
                    .then((response) => response.text())
                    .then((responseData) => rssParser.parse(responseData))
                    .then((rss) => {
                        // 展示订阅源的数据
                        console.log(rss.title);
                        console.log(rss.items.length);

                        // 请求订阅源的icon
                        let webUrl = rss.links[0].url.split("//")[1].split("?")[0].split("/")[0]
                        let iconUrl = `https://api.iowen.cn/favicon/${webUrl}.png`
                        console.log("iconurl -> ", iconUrl)

                        RNFetchBlob.fetch("GET", iconUrl)
                            .then((res) => {
                                let status = res.info().status
                                if (status == 200) {
                                    let base64Str = res.base64()
                                    console.log('成功了->', base64Str)
                                    props.changeStep(2, rss, url, base64Str)
                                } else {
                                    console.log('出错了')
                                }
                            })
                            .catch((errorMessage, statusCode) => {
                                alert('出错了')
                                console.log(statusCode, errorMessage)
                            });

                    })
                    .catch((error) => {
                        // 出错了
                        alert('出错了')
                        console.log(error)
                    })
            }} style={{ padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                <Ionicons name={'search-outline'} color={Colors.white} size={18} />
                <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>检测</Text>
                <View style={{ width: 18 }} />
            </TouchableOpacity>
        </View>
    )
}

let realm = null

const AddView = (props) => {

    const { rssData, xmlLink } = props
    const [data, setData] = useState(rssData)
    const { realm } = props.route.params

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Image source={{ uri: `data:image/png;base64,${base64Str}` }} style={{ width: 30, height: 30 }} />
            <Text style={{ color: Colors.grey1, fontWeight: 'bold', fontSize: 18 }}>{data.title}</Text>
            <Text style={{ color: Colors.grey20, fontSize: 14 }}>{data.description}</Text>
            <Text style={{ color: Colors.grey30, fontSize: 12 }}>{data.links[0].url}</Text>
            <Text style={{ color: Colors.grey30, fontSize: 12 }}>{data.items[0].authors[0].name}</Text>

            <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                // 添加到数据库
                try {
                    realm.write(() => {
                        let channel = realm.create("Channel", {
                            title: rssData.title,
                            type: rssData.type,
                            xmlLink: xmlLink,
                            htmlLink: rssData.links[0].url,
                            description: rssData.description,
                            lastUpdated: rssData.lastUpdated,
                            fold: '',
                            icon: `data:image/png;base64,${base64Str}`
                        })
                        // 保存channel
                        console.log(`保存成功: ${channel.title}`);

                        // 保存Item数据
                        for (item of rssData.items) {

                            let content = item.content ? item.content : (item.description ? item.description : "")
                            let description = content.replace(/<[^>]+>/g, "").replace(/(^\s*)|(\s*$)/g, "").substring(0, 300)

                            // 获取第一张图当封面
                            let htmlParser = Cheerio.load(content)
                            let cover = htmlParser('img').attr('src')
                            cover = cover ? cover : ''

                            console.log('cover ->', cover)

                            let rssItem = realm.create("RSSItem", {
                                title: item.title,
                                link: item.links[0].url,
                                description: description,
                                content: content,
                                author: item.authors[0].name,
                                published: item.published,
                                channelXmlLink: xmlLink,
                                channelTitle: rssData.title,
                                channelIcon: `data:image/png;base64,${base64Str}`,
                                readState: 0,
                                readMode: 0,
                                cover: cover
                            })
                        }
                        alert('保存成功')
                    })
                } catch (e) {
                    console.log('保存失败', e)
                    alert('保存失败')
                }
            }} style={{ padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                <Ionicons name={'save-outline'} color={Colors.white} size={18} />
                <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>保存</Text>
                <View style={{ width: 18 }} />
            </TouchableOpacity>
        </View>
    )
}

let rssData = null
let xmlLink = ''
let base64Str = ''

const AddChannelPage = ({ route }) => {

    const [step, setStep] = useState(1)

    const changeStep = (nextStep, data, link, base64) => {
        rssData = data
        xmlLink = link
        base64Str = base64
        // console.log(data)
        setStep(nextStep)
    }

    return (
        <View style={{ flex: 1 }}>
            {step == 1 ? <SearchView changeStep={changeStep} /> : <AddView rssData={rssData} xmlLink={xmlLink} route={route} />}
        </View>
    )
}

export default AddChannelPage