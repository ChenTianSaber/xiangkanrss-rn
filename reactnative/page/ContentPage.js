/**
 * 订阅源内容列表
 */
import React, { Component, useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View, Image, DeviceEventEmitter } from 'react-native'
import WebView from 'react-native-webview'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Colors } from 'react-native-ui-lib'

var moment = require('moment')

class ActionBar extends Component {

  state = { readState: 0 }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.setState({ readState: this.props.item.readState })
  }

  render() {
    const { item } = this.props
    return (
      <View style={{ width: '100%', height: 68, backgroundColor: '#f2f2f2', position: 'absolute', bottom: 0 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }} >
          {this.state.readState == 2 ? <Ionicons name={'ios-star'} size={26} color={Colors.yellow30} onPress={() => {
            this.setState({ readState: 0 })
            DeviceEventEmitter.emit('UPDATE_ITEM_READ_STATE', { title: item.title, state: 0 })
          }} /> : <Ionicons name={'ios-star-outline'} size={26} onPress={() => {
            this.setState({ readState: 2 })
            DeviceEventEmitter.emit('UPDATE_ITEM_READ_STATE', { title: item.title, state: 2 })
          }} />}
          {/* ellipse ios-star ios-star-outline*/}
          {this.state.readState == 1 ? <Ionicons name={'ellipse'} size={26} color={Colors.grey40} onPress={() => {
            this.setState({ readState: 0 })
            DeviceEventEmitter.emit('UPDATE_ITEM_READ_STATE', { title: item.title, state: 0 })
          }} /> : <Ionicons name={'ellipse-outline'} size={26} onPress={() => {
            this.setState({ readState: 1 })
            DeviceEventEmitter.emit('UPDATE_ITEM_READ_STATE', { title: item.title, state: 1 })
          }} />}
        </View>
        <View style={{ width: 1, height: 20 }} />
      </View>
    )
  }
}

const ContentPage = ({ route }) => {

  let item = route.params.item

  let html = `
    <!DOCTYPE html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="renderer" content="webkit">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover">
  <link href="style1.css" rel="stylesheet" type="text/css">
  <link href="style2.css" rel="stylesheet" type="text/css">
  <link href="style3.css" rel="stylesheet" type="text/css">
  <link href="style4.css" rel="stylesheet" type="text/css">
  <style>
    p {
      font-size: 17px;
    }

    h1 {
      font-size: 26px;
      margin-top: 2px;
      margin-bottom: 4px;
      line-height: 32px;
    }
  </style>
</head>


<body class="g-body--post-id">
  <div id="root">
    <div class="comp-style--transition--xlR9 g-comp--AppRouter">
      <div id="g-layout--MasterLayout" class="layout-wrapper--Vux7 g-page--post-id g-layout--MasterLayout">
        <div class="layout-container--xPy7 g-master-layout-container">
          <div class="post-type-header--di69 g-comp--PostHeaderTypeMixed">
            <div class="comp-wrapper--hzQm g-comp--PostHeaderType1Normal">
              <div class="comp-wrapper--pB2o corner--aoSv g-comp--PostTags">
                <span
                  class="comp-wrapper--i1sp tag-link--Y_fH js--top-index-link g-comp--SmartLink-for-span g-comp--undefined g-css--SmartLink">
                  <em class="symbol--ULec">#</em>
                  <strong class="tag-name--YLIt">${item.channelTitle}</strong>
                </span>
              </div>
              <a href="${item.link}"><h1><span class="comp-wrapper--QaPk g-comp--ColorTitle">${item.title}</span></h1></a>
              <div class="meta--xggW"><span class="author--pu_v">${item.author}</span><span class="time--GfTd">${moment(item.published).format('YYYY-MM-DD h:mm')}</span></div>
            </div>
          </div>
          <div class="page-inner--s_CE">
            <div class="content--AeDe content--loaded--Zh8G">
              <div class="comp-wrapper--gDGC g-comp--PostContent">
                <div class="g-typo g-post-content wangEditor-txt" id="g-post-content " style="font-size: 16px;">
                  <div class="js--post-dom" id="js--post-dom">
                  ${item.content}
                  </div>
                </div>
              </div>
              <div class="content-footer--gx_Z">
                <div class="comp-wrapper--aETv copyright--Wb4j g-comp--PostCopyright">© 「想看APP」，一个简洁好用的RSS阅读器。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>

</html>`

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ html: html, baseUrl: 'rssstyle/' }}
      />
      <ActionBar item={item} />
    </View>
  )
}

export default ContentPage