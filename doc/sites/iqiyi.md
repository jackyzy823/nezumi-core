#iQiyi#
##Tools:FFDEC##

###Subject1: [MainPlayer.swf](http://www.iqiyi.com/common/flashplayer/20150521/MainPlayer_5_2_23_c3_2_6_2.swf)###
####version:20150521_5_2_23_c3_2_6_2####

1. *ENCKEY* in `com.qiyi.player.core.model.remote.MixerRemote.as#getRequest@79`
2. VMS req in `com.qiyi.player.core.model.remote.MixerRemote.as#getRequest@87`
3. dispatchkey is generated in  `com.qiyi.player.core.model.remote.FirstDispatchRemote.as#onComplete@78` and defined in `com.qiyi.player.base.utils.KeyUtils.as#getDispatchKey@11` ,time from http://data.video.qiyi.com/t?tn={rand}

### Some definition from swf###
`bid` meaning for quality ,topspeed is not the best quality
>
`com.qiyi.player.core.model.def.DefinitonEnum`
0 none
1 standard
2 high
3 super
4 suprt-high
5 fullhd
10 4k
96 topspeed

### Changelog
-> http://www.iqiyi.com/common/flashplayer/20150612/MainPlayer_5_2_23_1_c3_2_6_5.swf
    In this version do not directly use enc key 
    gen enc key (so called sc ) in DMEmagelzzup.mix(tvid) -> (tm->getTimer(),src='hsalf',sc)
    encrypy alogrithm is md5(DMEmagelzzup.mix.genInnerKey +tm+tvid)
    how to gen genInnerKey ,can see first 3 lin in mix function in this file
