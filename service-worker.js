/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "894ab41fc588dfdf64cc85f81c689442"
  },
  {
    "url": "assets/css/0.styles.921552a2.css",
    "revision": "b5491824ab2725c1e25b5cc07ac1ff21"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Bold-Italic.a0475780.woff2",
    "revision": "a04757804840e4e870b5310e37fcbc37"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Bold.c318a45b.woff2",
    "revision": "c318a45b45be019ffdeb8c9ac6a41283"
  },
  {
    "url": "assets/fonts/JetBrainsMono-ExtraBold-Italic.045b7ab8.woff2",
    "revision": "045b7ab8d749812c052e9eca1ec5db07"
  },
  {
    "url": "assets/fonts/JetBrainsMono-ExtraBold.c3c08fc9.woff2",
    "revision": "c3c08fc9f418f827eb3eed1b0ebe48c8"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Italic.06bf2228.woff2",
    "revision": "06bf22283c831651e111b08000e502fc"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Medium-Italic.dd0da6de.woff2",
    "revision": "dd0da6de6c2340f4bf0aa4108f98a63f"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Medium.54b68275.woff2",
    "revision": "54b6827550ef145b4c1968518a96070f"
  },
  {
    "url": "assets/fonts/JetBrainsMono-Regular.3eacd637.woff2",
    "revision": "3eacd63796de4b39bc102dae7b143ca5"
  },
  {
    "url": "assets/img/elasticsearch.127a364f.png",
    "revision": "127a364f1ebb0efd25a7f6ee330d8d22"
  },
  {
    "url": "assets/img/git.c5852238.png",
    "revision": "c58522383c5c9d13c0b22a23c6a52aaa"
  },
  {
    "url": "assets/img/none.193dc0ca.png",
    "revision": "193dc0cab41365b59f6a1160838b727d"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/img/spring-cloud.2f90782c.png",
    "revision": "2f90782cd2797b6ebb64d02fd4a82f90"
  },
  {
    "url": "assets/js/10.a469e18d.js",
    "revision": "22216142221cf6460ec51301bf938a22"
  },
  {
    "url": "assets/js/11.fb494f77.js",
    "revision": "d6f1fe8935e04d5f53eae58f6eb02795"
  },
  {
    "url": "assets/js/12.ef5566c4.js",
    "revision": "569375c9a71ff4c00d0f7428d6297e11"
  },
  {
    "url": "assets/js/13.3b8d0b5d.js",
    "revision": "d66c220102a93b64db10279c16ff13fa"
  },
  {
    "url": "assets/js/14.140c04de.js",
    "revision": "0f1ca079ad4689be386324a4f2874ba0"
  },
  {
    "url": "assets/js/15.d4341f29.js",
    "revision": "085b224df9d1d346f685595cd8b82fee"
  },
  {
    "url": "assets/js/16.13609e5a.js",
    "revision": "345aaac565e6f5195bcbf5deccf7e0ac"
  },
  {
    "url": "assets/js/17.8d839705.js",
    "revision": "10f324533ebbe0f2585bb9c45bd19951"
  },
  {
    "url": "assets/js/19.601f1ae6.js",
    "revision": "f5357b87cbf7609c0574fb82fb401e36"
  },
  {
    "url": "assets/js/2.005090fa.js",
    "revision": "1715259fc30d2fe2e65ef184bb416fe8"
  },
  {
    "url": "assets/js/20.a80247a3.js",
    "revision": "ba09edf2cdc8686c1cdde39df3c33f23"
  },
  {
    "url": "assets/js/21.5df8d1b5.js",
    "revision": "d932979cd1b0e8ad1cad006a8afd8610"
  },
  {
    "url": "assets/js/22.29c983be.js",
    "revision": "702f8fed5591e5e12d997bd203e2baa5"
  },
  {
    "url": "assets/js/23.3f08e981.js",
    "revision": "c059d144087180b3312f71bebdbe065d"
  },
  {
    "url": "assets/js/24.5de7c387.js",
    "revision": "62d63a272a7eddb8231977dd24a7e6f7"
  },
  {
    "url": "assets/js/25.b8d794c7.js",
    "revision": "8a6a6d69803737e98fb6051a944b8873"
  },
  {
    "url": "assets/js/26.1279335e.js",
    "revision": "94d80bb2004fc039c09bda61d8744fdc"
  },
  {
    "url": "assets/js/27.49ccf039.js",
    "revision": "6388316a5699a7ea0df4bdd65e077eb8"
  },
  {
    "url": "assets/js/28.e9f1dd0e.js",
    "revision": "99b2d1c993562fce008760954b8e37d1"
  },
  {
    "url": "assets/js/29.40dcd264.js",
    "revision": "c49ea357a7677ed1145401185f6dc69c"
  },
  {
    "url": "assets/js/3.edaa3e28.js",
    "revision": "54abee8ed239076c6c458b8d07aa3045"
  },
  {
    "url": "assets/js/30.2fdda40e.js",
    "revision": "40b02cf4da6cc6dba4b250072db90184"
  },
  {
    "url": "assets/js/31.090db08d.js",
    "revision": "f7b21cfba58da4a99081a8bd2faf97bc"
  },
  {
    "url": "assets/js/32.b3366546.js",
    "revision": "a3f01e1a4054b271dac42c047c3e333f"
  },
  {
    "url": "assets/js/33.1add0a50.js",
    "revision": "819d31106572f39b5cff7c1521270d04"
  },
  {
    "url": "assets/js/34.4dd4b3f6.js",
    "revision": "346500530f4bc8d7a7fa558e9620795c"
  },
  {
    "url": "assets/js/35.d13711d9.js",
    "revision": "4599b8681565fac1306c8c9ed7410503"
  },
  {
    "url": "assets/js/36.c3d3560b.js",
    "revision": "568c5e0d717b81cd2ab3d8b3e6757669"
  },
  {
    "url": "assets/js/37.60003a05.js",
    "revision": "fd46f89efdc899c0a7a35927980c5eb7"
  },
  {
    "url": "assets/js/38.6ec600d2.js",
    "revision": "7006b1e2d5fcb71708aa7f31cf351121"
  },
  {
    "url": "assets/js/39.18d5fbee.js",
    "revision": "caf885283442d773dc4c579194287fc2"
  },
  {
    "url": "assets/js/4.c54fd058.js",
    "revision": "d648d55cf4010380019a3075a11ab5e9"
  },
  {
    "url": "assets/js/40.011046c3.js",
    "revision": "c049bf1c3365561c76aa063ad1966a51"
  },
  {
    "url": "assets/js/41.8de975d0.js",
    "revision": "1987e1e0d2e575471319012e0cfa95ae"
  },
  {
    "url": "assets/js/42.0a1b3476.js",
    "revision": "1b9b148b29e93671b48665d72c952aed"
  },
  {
    "url": "assets/js/43.de7aede9.js",
    "revision": "9bd207a2f244103973e6ca31c7929274"
  },
  {
    "url": "assets/js/44.bc5cbf31.js",
    "revision": "623b447b34ac93117eb3a1dc023ce840"
  },
  {
    "url": "assets/js/45.e8ea55e5.js",
    "revision": "1dbacd14fa4a98d7741d12ac2c0f6904"
  },
  {
    "url": "assets/js/5.e2617bcd.js",
    "revision": "f5cdeb1dfef37712a25fd632ebc47337"
  },
  {
    "url": "assets/js/6.51b4a227.js",
    "revision": "74606ca0f4c01d83c06647a281319864"
  },
  {
    "url": "assets/js/7.6b95ce54.js",
    "revision": "ea104edc3326aeb4b2f4325e9932a46e"
  },
  {
    "url": "assets/js/8.5269bfb0.js",
    "revision": "0ed2d5489a7ee4afa2ab683539ecb715"
  },
  {
    "url": "assets/js/9.4d7921ca.js",
    "revision": "d96851030862b79ff0d3df17c9e33023"
  },
  {
    "url": "assets/js/app.56d7b011.js",
    "revision": "23ea70f2fd398ebac34663a4e61b10ad"
  },
  {
    "url": "computer_theory/Os/index.html",
    "revision": "75752a38a4b045bfc6808d7c431a51a4"
  },
  {
    "url": "database/mysql/index.html",
    "revision": "46087483fdfb24fe1f13ebefdd87d1b3"
  },
  {
    "url": "database/redis/index.html",
    "revision": "3f11c5f1364748ec229b853c788e276b"
  },
  {
    "url": "favorite_article/index.html",
    "revision": "02ab8dabf3c166c9145652656d3d9926"
  },
  {
    "url": "framework/netty/index.html",
    "revision": "4d40fec51c994f6aba654999fbdce682"
  },
  {
    "url": "framework/spring_aop/index.html",
    "revision": "f83bb376c4fa4a3455f2985709c6c2bd"
  },
  {
    "url": "framework/spring_boot/index.html",
    "revision": "aaef64b98d9b0c42c435421ef30b574e"
  },
  {
    "url": "framework/spring_cloud/index.html",
    "revision": "53cf694af85e31cc6108709570f56daf"
  },
  {
    "url": "framework/spring_framework/index.html",
    "revision": "e6971e2f2808243c59b3966f6f763d0a"
  },
  {
    "url": "hero.png",
    "revision": "d1fed5cb9d0a4c4269c3bcc4d74d9e64"
  },
  {
    "url": "index.html",
    "revision": "ae6ff8f47267b3da29617c9bd870e852"
  },
  {
    "url": "interview/auth/cyber_security.html",
    "revision": "c19d276fe7e6426471b1e9000953fbec"
  },
  {
    "url": "interview/common_framework/Mybatis.html",
    "revision": "8e711cd2376d3834d4de71491e39e857"
  },
  {
    "url": "interview/common_framework/Netty.html",
    "revision": "b32ab733276144405815f15518204cd5"
  },
  {
    "url": "interview/common_framework/Spring.html",
    "revision": "fb6e78c9d976eb22257573a6d0064b53"
  },
  {
    "url": "interview/common_framework/SpringBoot.html",
    "revision": "af71c807a97fe9e7f6a5bc099daba1b4"
  },
  {
    "url": "interview/database/Elasticsearch.html",
    "revision": "a4ae64682eaae73bb3ddc5ee22988c90"
  },
  {
    "url": "interview/database/MySQL.html",
    "revision": "ddb8f2e76ec0ca0e9b5d858ffbdeb90b"
  },
  {
    "url": "interview/database/Redis.html",
    "revision": "046637c31ea2baea7febf612ed8287b4"
  },
  {
    "url": "interview/distributed/microservice.html",
    "revision": "d6149280f88300b3a87edbd9510896e7"
  },
  {
    "url": "interview/distributed/mq.html",
    "revision": "8de3845955e737cbd9071581bf6d66aa"
  },
  {
    "url": "interview/index.html",
    "revision": "75fd6ab36d5177d336cad869e0693b56"
  },
  {
    "url": "interview/java_basics/Java_basics.html",
    "revision": "3e89ef1a46661080cc13bd21680cfb00"
  },
  {
    "url": "interview/java_basics/Java_collections.html",
    "revision": "0d9860aee022dc50bb527dd5f16052fc"
  },
  {
    "url": "interview/java_basics/Java_concurrency.html",
    "revision": "6a7ed2ae6ad8a848d17dd4fa7ce9645f"
  },
  {
    "url": "interview/java_basics/Java_network.html",
    "revision": "1655b05854395e353f840e15c1896589"
  },
  {
    "url": "interview/java_basics/Java_virtual_machine.html",
    "revision": "98a15678288b293783c2547631f45fa9"
  },
  {
    "url": "java_basics/core_technology/index.html",
    "revision": "c5562742453218068f10cd63be45e983"
  },
  {
    "url": "java_basics/functional_programming/index.html",
    "revision": "1a1b3d2f0726c5fcb8c33cbe8b1a5da0"
  },
  {
    "url": "java_basics/index.html",
    "revision": "6c6540ea2ee42ad291d0437f55d130b6"
  },
  {
    "url": "java_basics/knowledge_system/index.html",
    "revision": "6729a465c78e17cbece3b2bf12ad5ce1"
  },
  {
    "url": "jb_beam.svg",
    "revision": "1c06ca026a71d10dbdedf49e2fd9534e"
  },
  {
    "url": "leetcode/algorithm.html",
    "revision": "a67a34c21dfd607fe604a018b54fd8ce"
  },
  {
    "url": "leetcode/data_structure.html",
    "revision": "f8e167d4206ab20d094f53d53b5974e1"
  },
  {
    "url": "leetcode/index.html",
    "revision": "93734c15ef3c830bb2dd582c2ceeaa28"
  },
  {
    "url": "middleware/jvm/index.html",
    "revision": "2e1e0e8b1c0769ed4f475a0c25d9dcf5"
  },
  {
    "url": "middleware/mq/index.html",
    "revision": "fcd4503dd24699911af397b17298ddad"
  },
  {
    "url": "middleware/Tomcat/index.html",
    "revision": "fb2ee87a6af5b84f8a6faf615bf2d3d1"
  },
  {
    "url": "mlogo.svg",
    "revision": "22138c2cbb5377233627b72d69292170"
  },
  {
    "url": "mlogo2.png",
    "revision": "f6679cd8ff713b61e7691a2f31886dd4"
  },
  {
    "url": "mlogo2.svg",
    "revision": "ac847ef8c526f385e7288c4808a7b830"
  },
  {
    "url": "mlogo3.svg",
    "revision": "31ca98dff6243bcda7269eba0d58d002"
  },
  {
    "url": "test-book.jpg",
    "revision": "a81dc891aab89548ce449c84b7cd333c"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
