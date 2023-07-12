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
    "revision": "7ac5aed9c45a0e8e318569cfba255102"
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
    "url": "assets/js/10.99a5b01e.js",
    "revision": "bfa7baf13b83aa343f3a4ad4524b5d66"
  },
  {
    "url": "assets/js/11.a27261a3.js",
    "revision": "78da10abc89b64262c8cd06127bc5274"
  },
  {
    "url": "assets/js/12.03f121e9.js",
    "revision": "69a6eb5a7152d09d7d6ad5d3ece053fa"
  },
  {
    "url": "assets/js/13.663ebfe9.js",
    "revision": "e32236d3be91eb12d953f91ff29349e0"
  },
  {
    "url": "assets/js/14.90602438.js",
    "revision": "2c8d60cdad80c1f4a08d6618c7b2bbba"
  },
  {
    "url": "assets/js/15.f25d5073.js",
    "revision": "e5bc97e8afe33d06d3a3c94529cdb5f8"
  },
  {
    "url": "assets/js/16.6fe96973.js",
    "revision": "ddae38768f325337fd612373e45cdbcc"
  },
  {
    "url": "assets/js/17.9770380b.js",
    "revision": "8c81dfb70029bfd78c0b933a55c527da"
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
    "url": "assets/js/9.9017b2b1.js",
    "revision": "4cc9ef4576f257d9f580342ada004d13"
  },
  {
    "url": "assets/js/app.551d41ca.js",
    "revision": "6142e1cf794b12f1f6b0d3b14659e404"
  },
  {
    "url": "computer_theory/Os/index.html",
    "revision": "dbef625bc745187a21515c5e99d70fea"
  },
  {
    "url": "database/mysql/index.html",
    "revision": "3f72a57fdddf917286f44f329d07782e"
  },
  {
    "url": "database/redis/index.html",
    "revision": "5f380143d9ed0a98412bc4293c5529a6"
  },
  {
    "url": "favorite_article/index.html",
    "revision": "1752d297b3a296bff2bfb1102b0c3dbb"
  },
  {
    "url": "framework/netty/index.html",
    "revision": "7d9706e6d265f2716238b29029e05b1f"
  },
  {
    "url": "framework/spring_aop/index.html",
    "revision": "60bda0f63923c66f9b81d0ed6f180f69"
  },
  {
    "url": "framework/spring_boot/index.html",
    "revision": "d3fde3cc41fb5a41b32b978c671c3e50"
  },
  {
    "url": "framework/spring_cloud/index.html",
    "revision": "b61805095f1cb33077acf10f4acb5497"
  },
  {
    "url": "framework/spring_framework/index.html",
    "revision": "f667a2479c0e856470964617db3e60a0"
  },
  {
    "url": "hero.png",
    "revision": "d1fed5cb9d0a4c4269c3bcc4d74d9e64"
  },
  {
    "url": "index.html",
    "revision": "18eb1a657718239f59aa93333f5714bd"
  },
  {
    "url": "interview/auth/cyber_security.html",
    "revision": "83f6c99276e9567917c68dc4500c5c65"
  },
  {
    "url": "interview/common_framework/Mybatis.html",
    "revision": "b2bfaf55960717391b762b1ccecd53f1"
  },
  {
    "url": "interview/common_framework/Netty.html",
    "revision": "b86e2dc004fb16507911efe35fc3464b"
  },
  {
    "url": "interview/common_framework/Spring.html",
    "revision": "a29dfa1f574555c43f4c93caf556d543"
  },
  {
    "url": "interview/common_framework/SpringBoot.html",
    "revision": "2ed6826bcc8603eea64ca1c6636bfb53"
  },
  {
    "url": "interview/database/Elasticsearch.html",
    "revision": "c1ceaba8404a0f18d393fffe8651d59c"
  },
  {
    "url": "interview/database/MySQL.html",
    "revision": "cf6c357c7c495149ae7268523e5c7ce5"
  },
  {
    "url": "interview/database/Redis.html",
    "revision": "022bc9b38cf6ece2fa9ff51f48fb4df4"
  },
  {
    "url": "interview/distributed/microservice.html",
    "revision": "66680b764bb0ebe79c5dd43334f4be09"
  },
  {
    "url": "interview/distributed/mq.html",
    "revision": "b9b536bad999608ecc18e6a18b9700e2"
  },
  {
    "url": "interview/index.html",
    "revision": "a9f8ec73ec8a141ec00134c1fa00e643"
  },
  {
    "url": "interview/java_basics/Java_basics.html",
    "revision": "dba1eef40f2f75b194c957b316c1fc74"
  },
  {
    "url": "interview/java_basics/Java_collections.html",
    "revision": "bf4c6342ac9d7c73537f0c815f6d403a"
  },
  {
    "url": "interview/java_basics/Java_concurrency.html",
    "revision": "125321694e2081989e0ed1de6773cc1e"
  },
  {
    "url": "interview/java_basics/Java_network.html",
    "revision": "f72d41a813c0834ab56fe6e053f614b0"
  },
  {
    "url": "interview/java_basics/Java_virtual_machine.html",
    "revision": "9b22f5d582d4a2efac27aac911f900fc"
  },
  {
    "url": "java_basics/core_technology/index.html",
    "revision": "c7ef987d003ff5ee06b418823d54175f"
  },
  {
    "url": "java_basics/functional_programming/index.html",
    "revision": "33b0644667b4adf87711f68422f54c49"
  },
  {
    "url": "java_basics/index.html",
    "revision": "5bb189bc4060df14bb86540f40478a1e"
  },
  {
    "url": "java_basics/knowledge_system/index.html",
    "revision": "7301708b9fd6367346fb1cc3b1b70d2f"
  },
  {
    "url": "jb_beam.svg",
    "revision": "1c06ca026a71d10dbdedf49e2fd9534e"
  },
  {
    "url": "leetcode/algorithm.html",
    "revision": "cd1fea4c49b4d4d2cee0a9ad0520a478"
  },
  {
    "url": "leetcode/data_structure.html",
    "revision": "51a2fd02edf888d075367a665e27c541"
  },
  {
    "url": "leetcode/index.html",
    "revision": "64869d14eb3eb88d4c8af317d549eaad"
  },
  {
    "url": "middleware/jvm/index.html",
    "revision": "2292a346f5f812d5a5a80266e0412228"
  },
  {
    "url": "middleware/mq/index.html",
    "revision": "8dadc664b34bffd04abb2f468129665c"
  },
  {
    "url": "middleware/Tomcat/index.html",
    "revision": "31b58abf7652fcb6424a987cee706214"
  },
  {
    "url": "mlogo.svg",
    "revision": "ac847ef8c526f385e7288c4808a7b830"
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
