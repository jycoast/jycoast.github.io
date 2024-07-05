import{_ as s,o as n,c as a,e as t}from"./app-CaFxfVQ9.js";const e={},i=t(`<h1 id="elaticsearch" tabindex="-1"><a class="header-anchor" href="#elaticsearch"><span>ElaticSearch</span></a></h1><h2 id="elaticsearch快速入门" tabindex="-1"><a class="header-anchor" href="#elaticsearch快速入门"><span>ElaticSearch快速入门</span></a></h2><p>全文检索是指：</p><ol><li>通过一个程序扫描文本中的每一个单词，针对单词建立索引，并保存该单词在文本中的位置、以及出现的次数</li><li>用户查询时，通过之前建立好的索引来查询，将索引中单词对应的文本位置、出现的次数返回给用户，因为有了具体文本的位置，所以就可以将具体的内容读取出来了</li></ol><p>例如，在csdn中搜索elaticsearch快速入门：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309042317865.png" alt="image-20230904231737762" style="zoom:50%;"><h3 id="倒排索引" tabindex="-1"><a class="header-anchor" href="#倒排索引"><span>倒排索引</span></a></h3><p>索引类似目录，平时我们使用的都是索引，通过主键定位到某条数据，倒排索引则是数据对应到主键。</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309042320107.png" alt="image-20230904232024006" style="zoom:67%;"><p>这里以一个博客文章的内容为例：</p><p>正排索引：</p><table><thead><tr><th>文章ID</th><th>文章标题</th><th>文章内容</th></tr></thead><tbody><tr><td>1</td><td>浅析Java设计模式</td><td>Java设计模式是每一个Java程序员都应该掌握的进阶知识</td></tr><tr><td>2</td><td>Java多线程设计模式</td><td>Java多线程与设计模式结合</td></tr></tbody></table><p>假设有一个站内搜索的功能，是通过某个关键词来搜索相关的文章，那么这个关键词可能出现在标题中，也可能出现在文章内容中，那我们将会在创建或修改文章的时候，建立一个关键词与文章的对应关系表，这种我们就可以称之为倒排索引。</p><p>假设我们搜索关键词“Java设计模式”，那么就可以通过倒排索引，找到对应的文章的主键id。</p><table><thead><tr><th>关键词</th><th>文章ID</th></tr></thead><tbody><tr><td>Java</td><td>1，2</td></tr><tr><td>设计模式</td><td>1，2</td></tr><tr><td>多线程</td><td>2</td></tr></tbody></table><p>简单理解，正向索引是通过key找value，反向索引则是通过value找key。ElaticSearch底层在检索时使用的就是倒排索引。</p><h3 id="elaticsearch简介" tabindex="-1"><a class="header-anchor" href="#elaticsearch简介"><span>ElaticSearch简介</span></a></h3><p>ElaticSearch（简称ES）是一个分布式、RESTful风格的搜索和数据分析引擎，是用Java开发并且是当前最流行的开源的企业级搜索引擎，能够达到近实时搜索，稳定，可靠，快速，安装使用方便。</p><p>ES起源于Lucene，基于Java语言开发，具有高性能，易扩展的优点，ES有以下应用场景：</p><ul><li>站内搜索</li><li>日志管理与分析</li><li>大数据分析</li><li>应用性能监控</li><li>机器学习</li></ul><p>传统的关系型数据库和ES的区别：</p><ul><li>ES：Schemaless/相关性/高性能全文检索</li><li>RDMS：事务性/Join</li></ul><h3 id="elaticsearch基本概念" tabindex="-1"><a class="header-anchor" href="#elaticsearch基本概念"><span>ElaticSearch基本概念</span></a></h3><p>可以将ES中的一些基本概念映射到关系型数据库：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309042344854.png" alt="image-20230904234430757" style="zoom:50%;"><h5 id="索引" tabindex="-1"><a class="header-anchor" href="#索引"><span>索引</span></a></h5><p>一个索引就是一个拥有几分相似特征的文档的集合。比如说，可以有一个客户数据的索引，另一个产品目录的索引，还有一个订单数据的索引。</p><p>一个索引由一个名字来表示同意（必须全部是小写字母的），并且当我们要对对应于这个索引的文档进行索引、搜索、更新和删除操作的时候，都要用到这个名字。</p><h4 id="文档" tabindex="-1"><a class="header-anchor" href="#文档"><span>文档</span></a></h4><p>ES是面向文档的，文档是所有可搜索数据的最小单位。例如：</p><ul><li>日志文件中的日志项</li><li>一本电影的具体信息/一张唱片的详细信息</li><li>MP3播放器里的一首歌/一篇PDF文档中的具体内容</li></ul><p>文档会被序列化成JSON格式，保存在ES中：</p><ul><li>JSON对象由字段组成</li><li>每个字段都有对应的字段类型（字符串/数值/布尔/日期/二进制/范围类型）</li></ul><p>每个文档都有一个Unique UD，可以自己指定ID或者通过ES自动生成。一篇文档包含了一系列字段，类似关系型数据库表中的一条记录。</p><p>JSON文档，格式灵活，不需要预先定义格式：</p><ul><li>字段的类型可以指定或者通过ES自动推算</li><li>支持数组/支持嵌套</li></ul><p>文档的元数据信息：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309112314879.png" alt="image-20230911231457769" style="zoom:50%;"><p>其中各项含义：</p><ul><li>_index：文档所属的索引名</li><li>：文档所属的类型名</li><li>_id：文档唯一Id</li><li>_source：文档的原始JSON数据</li><li>_version：文档的版本号，修改删除操作 _version 都会自增1</li><li>_seq_no：和 _version 一样，一旦数据发生更改，数据也一直是累计的。Shard级别严格递增，保证后写入的Doc的 _seq_no 大于先写入Doc的 _seq_no。</li><li>_primary_term： _primary_term 主要是用来恢复数据时处理当多个文档的 _seq_no 一样时的冲突，避免Primary Shard上的写入被覆盖。每当Primary Shard发生重新分配时，比如重启，Primary选举等， _primary_term 会递增1。</li></ul><h4 id="索引操作" tabindex="-1"><a class="header-anchor" href="#索引操作"><span>索引操作</span></a></h4><p>注意：索引命名必须小写，不能以下划线开头。</p><p>创建索引格式：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#创建索引</span>
PUT /es_db

<span class="token comment">#创建索引时可以设置分片数和副本数</span>
PUT /es_db
<span class="token punctuation">{</span>
    <span class="token string">&quot;settings&quot;</span> <span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;number_of_shards&quot;</span> <span class="token builtin class-name">:</span> <span class="token number">3</span>,
        <span class="token string">&quot;number_of_replicas&quot;</span> <span class="token builtin class-name">:</span> <span class="token number">2</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">#修改索引配置</span>
PUT /es_db/_settings
<span class="token punctuation">{</span>
  <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;number_of_replicas&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="文档操作" tabindex="-1"><a class="header-anchor" href="#文档操作"><span>文档操作</span></a></h4><p>添加示例数据：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>PUT /es_db
<span class="token punctuation">{</span>
    <span class="token string">&quot;settings&quot;</span> <span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;index&quot;</span> <span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;analysis.analyzer.default.type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_max_word&quot;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

PUT /es_db/_doc/1
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州天河公园&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>
<span class="token punctuation">}</span>
PUT /es_db/_doc/2
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;李四&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">28</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州荔湾大厦&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java assistant&quot;</span>
<span class="token punctuation">}</span>

PUT /es_db/_doc/3
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;王五&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">26</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州白云山公园&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;php developer&quot;</span>
<span class="token punctuation">}</span>

PUT /es_db/_doc/4
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;赵六&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">22</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;长沙橘子洲&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;python assistant&quot;</span>
<span class="token punctuation">}</span>

PUT /es_db/_doc/5
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张龙&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">19</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;长沙麓谷企业广场&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java architect assistant&quot;</span>
<span class="token punctuation">}</span>	
	
PUT /es_db/_doc/6
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;赵虎&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">32</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;长沙麓谷兴工国际产业园&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java architect&quot;</span>
<span class="token punctuation">}</span>	
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加文档：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 创建文档,指定id</span>
<span class="token comment"># 如果id不存在，创建新的文档，否则先删除现有文档，再创建新的文档，版本会增加</span>
PUT /es_db/_doc/1
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州天河公园&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>
<span class="token punctuation">}</span>	

<span class="token comment">#创建文档，ES生成id</span>
POST /es_db/_doc
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>,
<span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州天河公园&quot;</span>,
<span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>POST和PUT都能起到创建/更新的作用，PUT需要对一个具体的资源进行操作，也就是要确定id才能进行更新/创建；POST时可以针对整个资源集合进行操作的，如果不写id就由ES生成一个唯一id进行创建新文档，如果填了id那就针对这个id的文档进行创建/更新。</p><p>使用PUT更新文档的时候，整个json都会被替换，也就是说，如果文档存在，现有文档会被删除，新的文档会被索引。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 全量更新，替换整个json</span>
PUT /es_db/_doc/1
<span class="token punctuation">{</span>
<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,
<span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,
<span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>
<span class="token punctuation">}</span>

<span class="token comment">#查询文档</span>
GET /es_db/_doc/1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果需要部分更新，可以使用 _update，格式：POST /索引名称/_update/id。_update不会删除原来的文档，而是实现真正的数据更新。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 部分更新：在原有文档上更新</span>
<span class="token comment"># Update -文档必须已经存在，更新只会对相应字段做增量修改</span>
POST /es_db/_update/1
<span class="token punctuation">{</span>
  <span class="token string">&quot;doc&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">28</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">#查询文档</span>
GET /es_db/_doc/1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>还可以使用_update_by_query更新文档：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST /es_db/_update_by_query
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span> 
    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;script&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;source&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ctx._source.age = 30&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>_seq_no 和 _primary_term 是对 _version的优化，7.x版本的ES默认使用这种方式控制版本，所以当在高并发环境下使用乐观锁机制修改文档时，要带上文档的 _seq_no 和 _primary_term 进行更新：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST /es_db/_doc/2?if_seq_no<span class="token operator">=</span><span class="token number">21</span><span class="token operator">&amp;</span><span class="token assign-left variable">if_primary_term</span><span class="token operator">=</span><span class="token number">6</span>
<span class="token punctuation">{</span>
  <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;李四xxx&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果版本号不对，就会抛出版本冲突异常，如下图：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171621035.png" alt="image-20230917162118923" style="zoom:67%;"><p>查询文档有两种方式。</p><p>根据id查询文档，格式：GET /索引名称/_doc/id</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>GET /es_db/_doc/1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>条件查询_search，格式：GET /索引名称/_doc/_search</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查询前10条文档</span>
GET /es_db/_doc/_search
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>ES Search API提供了两种查询条件查询搜索方式：</p><ul><li>REST风格的请求URI，直接将参数带过去</li><li>封装到request body中，这种方式可以定义更加易读的JSON格式</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#通过URI搜索，使用“q”指定查询字符串，“query string syntax” KV键值对</span>

<span class="token comment">#条件查询, 如要查询age等于28岁的 _search?q=*:***</span>
GET /es_db/_doc/_search?q<span class="token operator">=</span>age:28

<span class="token comment">#范围查询, 如要查询age在25至26岁之间的 _search?q=***[** TO **]  注意: TO 必须为大写</span>
GET /es_db/_doc/_search?q<span class="token operator">=</span>age<span class="token punctuation">[</span><span class="token number">25</span> TO <span class="token number">26</span><span class="token punctuation">]</span>

<span class="token comment">#查询年龄小于等于28岁的 :&lt;=</span>
GET /es_db/_doc/_search?q<span class="token operator">=</span>age:<span class="token operator">&lt;=</span><span class="token number">28</span>
<span class="token comment">#查询年龄大于28前的 :&gt;</span>
GET /es_db/_doc/_search?q<span class="token operator">=</span>age:<span class="token operator">&gt;</span><span class="token number">28</span>

<span class="token comment">#分页查询 from=*&amp;size=*</span>
GET /es_db/_doc/_search?q<span class="token operator">=</span>age<span class="token punctuation">[</span><span class="token number">25</span> TO <span class="token number">26</span><span class="token punctuation">]</span><span class="token operator">&amp;</span><span class="token assign-left variable">from</span><span class="token operator">=</span><span class="token number">0</span><span class="token operator">&amp;</span><span class="token assign-left variable">size</span><span class="token operator">=</span><span class="token number">1</span>

<span class="token comment">#对查询结果只输出某些字段 _source=字段,字段</span>
GET /es_db/_doc/_search?_source<span class="token operator">=</span>name,age

<span class="token comment">#对查询结果排序 sort=字段:desc/asc</span>
GET /es_db/_doc/_search?sort<span class="token operator">=</span>age:desc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过请求体搜索的示例：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>GET /es_db/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州白云&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>删除文档的格式：DELETE /索引名称/_doc/id。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>DELETE /es_db/_doc/1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="es文档批量操作" tabindex="-1"><a class="header-anchor" href="#es文档批量操作"><span>ES文档批量操作</span></a></h3><p>批量操作可以减少网络连接所产生的开销，提升性能。</p><ul><li>支持在一次API调用中，对不同的索引进行操作</li><li>可以在URI中指定index，也可以在请求的Payload中进行</li><li>操作中单条操作失败，并不会影响其他操作</li><li>返回结果中包含了每一条操作执行的结果</li></ul><p>批量对文档进行写操作是通过 _bulk 的API来实现的。</p><ul><li>请求方式：POST</li><li>请求地址：_bulk</li><li>请求参数：通过 _bulk 操作文档，一般至少有两行参数（或偶数行参数） <ul><li>第一行参数为执行操作的类型及操作的对象（index，type和id）</li><li>第二行参数才是操作的数据</li></ul></li></ul><p>参数类似于：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token punctuation">{</span><span class="token string">&quot;actionName&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;indexName&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;typeName&quot;</span>,<span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;field1&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;value1&quot;</span>, <span class="token string">&quot;field2&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;value2&quot;</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>actionName表示操作类型，主要有create，index，delete和update。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST _bulk
<span class="token punctuation">{</span><span class="token string">&quot;create&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:3,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox老师&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox老师666&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>,<span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;create&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:4,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;mark老师&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;mark老师NB&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>,<span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果原文档不存在，则会创建新文档，如果原文档存在，则是替换（全量修改原文档）。</p><p>批量删除delete：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST _bulk
<span class="token punctuation">{</span><span class="token string">&quot;delete&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;delete&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>批量修改update：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST _bulk
<span class="token punctuation">{</span><span class="token string">&quot;update&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;doc&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;ES大法必修内功&quot;</span><span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;update&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;doc&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;create_time&quot;</span>:1554018421008<span class="token punctuation">}</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>组合应用：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>POST _bulk
<span class="token punctuation">{</span><span class="token string">&quot;create&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:3,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox老师&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox老师666&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>,<span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;delete&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;update&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>,<span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>,<span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;doc&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;create_time&quot;</span>:1554018421008<span class="token punctuation">}</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ES的批量查询可以用mget和msearch两种，其中mget是需要我们知道它的id，可以指定不同的index，也可以指定返回值source。msearch可以通过字段查询来进行一个批量的查找。</p><p>_mget 的使用方式如下：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#可以通过ID批量获取不同index和type的数据</span>
GET _mget
<span class="token punctuation">{</span>
  <span class="token string">&quot;docs&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      <span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;es_db&quot;</span>,
      <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>
    <span class="token punctuation">}</span>,
    <span class="token punctuation">{</span>
      <span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;article&quot;</span>,
      <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">4</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>

<span class="token comment">#可以通过ID批量获取es_db的数据</span>
GET /es_db/_mget
<span class="token punctuation">{</span>
  <span class="token string">&quot;docs&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>
    <span class="token punctuation">}</span>,
    <span class="token punctuation">{</span>
      <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">4</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>

<span class="token comment">#简化后</span>
GET /es_db/_mget
<span class="token punctuation">{</span>
  <span class="token string">&quot;ids&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token string">&quot;1&quot;</span>,
    <span class="token string">&quot;2&quot;</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>_msearch 的使用方式如下：</p><p>在 _msearch 中，请求格式和bulk类似。查询一条数据需要两个对象，第一个设置index和type，第二个设置查询语句。查询语句和search相同。如果只是查询一个index，我们可以在url中带上index，这样，如果查该index可以直接用空对象表示。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>GET /es_db/_msearch
<span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;query&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;match_all&quot;</span>:<span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">}</span>,<span class="token string">&quot;from&quot;</span>:0,<span class="token string">&quot;size&quot;</span>:2<span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span><span class="token punctuation">}</span>
<span class="token punctuation">{</span><span class="token string">&quot;query&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;match_all&quot;</span>:<span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="elaticsearch高级查询语法query-dsl" tabindex="-1"><a class="header-anchor" href="#elaticsearch高级查询语法query-dsl"><span>ElaticSearch高级查询语法Query DSL</span></a></h2><p>参考链接：https://note.youdao.com/ynoteshare/index.html?id=924a9d435d78784455143b1dda4a874a&amp;type=note&amp;_time=1684249060388</p><p>当数据写入ES时，数据将会通过分词被切分为不同的trem，ES将term与其对应的文档列表建立一种映射关系，这种结构就是倒排索引。如下图所示：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171736007.png" alt="image-20230917173618891" style="zoom:67%;"><p>为了进一步提升索引的效率，ES在term的基础上利用term的前缀或者后缀构建了term index，用于对term本身进行索引，ES实际的索引结构如下图所示：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171738393.png" alt="image-20230917173801277" style="zoom:67%;"><p>这样当我们去搜索某个关键词时，ES首先根据它的前缀或者后缀迅速缩小关键词在term dictionary中的范围，大大减少了磁盘IO的次数。</p><ul><li>单词词典（Term Dictionary）：记录所有文档的单词，记录单词到倒排所列的关联关系。</li><li>倒排列表（Posting List）：记录了单词对应的文档结合，由倒排索引项组成</li><li>倒排索引项（Posting）： <ul><li>文档ID</li><li>词频TF-该单词在文档中出现的次数，用于相关性评分</li><li>位置（Position）-单词在文档中的分析的位置，用于短语搜索（match phrase query）</li><li>偏移（Offset）-记录单词的开始结束位置，实现高亮线显示</li></ul></li></ul><p>ES的JSON文档中的每个字段，都有自己的倒排索引，可以指定对某些字段不做索引：</p><ul><li>优点：节省内存空间</li><li>缺点：字段无法被搜索</li></ul><h4 id="文档映射mapping" tabindex="-1"><a class="header-anchor" href="#文档映射mapping"><span>文档映射mapping</span></a></h4><p>Mapping类似数据库中的schema的定义，作用如下：</p><ul><li>定义索引中的字段的名称</li><li>定义字段的数据类型，例如字符串，数字，布尔等</li><li>字段，倒排索引的相关配置（Analyzer）</li></ul><p>ES中Mapping映射可以分为动态映射和静态映射。</p><p>在关系型数据库中，需要先创建数据库，然后在该数据库下创建数据表，并创建表字段、类型、长度、主键等，最后才能基于表插入数据。而ES中不需要预先定义Mapping映射（即关系型数据库的表、字段等），在文档写入ES时，会根据文档的字段自动识别类型，这种机制称之为动态映射。</p><p>与之对应的，在ES中预先定义好映射，包含文档的各字段类型、分词器等，这种方式称之为静态映射。</p><p>动态映射的机制，使得我们无需手动定义Mappings，ES会自动根据文档信息，推算出字段的类型，但是由的时候会推算的不对，例如地理位置信息。当类型如果设置的不对时，会导致一些功能无法正常运行，例如Range查询。</p><p>Dynamic Mapping类型自动识别：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171800754.png" alt="image-20230917180005622" style="zoom:67%;"><p>示例：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#删除原索引</span>
DELETE /user

<span class="token comment">#创建文档(ES根据数据类型, 会自动创建映射)</span>
PUT /user/_doc/1
<span class="token punctuation">{</span>
  <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox&quot;</span>,
  <span class="token string">&quot;age&quot;</span>:32,
  <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;长沙麓谷&quot;</span>
<span class="token punctuation">}</span>

<span class="token comment">#获取文档映射</span>
GET /user/_mapping
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>执行结果：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171802257.png" alt="image-20230917180243143" style="zoom:67%;"><p>对于已经创建的文档，如果要更改Mapping的字段类型，有两种情况：</p><ul><li>新增加的字段 <ul><li>dynamic设为true时，一旦有新增的文档写入，Mapping也同时被更新</li><li>dynamic设为false，Mapping不会被更新，新增字段的数据无法被索引，但是信息会出现在 _source 中</li><li>dynamic设置为strict（严格控制策略），文档写入失败，抛出异常</li></ul></li><li>对于已有字段，一旦已经有数据写入，就不再支持修改字段定义 <ul><li>Lucene实现的倒排索引，一旦生成后，就不允许修改</li><li>如果希望改变字段类型，可以利用reindex API，重建索引</li></ul></li></ul><p>这样设计的原因是：</p><ul><li>如果修改了字段的数据类型，会导致已经被索引的数据无法被搜索</li><li>但是如果是增加新的字段，就不会有这样的影响</li></ul><p>测试用例：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>PUT /user
<span class="token punctuation">{</span>
  <span class="token string">&quot;mappings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;dynamic&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;strict&quot;</span>,
    <span class="token string">&quot;properties&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>
      <span class="token punctuation">}</span>,
      <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;object&quot;</span>,
        <span class="token string">&quot;dynamic&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;true&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token comment"># 插入文档报错，原因为age为新增字段,会抛出异常</span>
PUT /user/_doc/1
<span class="token punctuation">{</span>
  <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;fox&quot;</span>,
  <span class="token string">&quot;age&quot;</span>:32,
  <span class="token string">&quot;address&quot;</span>:<span class="token punctuation">{</span>
    <span class="token string">&quot;province&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;湖南&quot;</span>,
    <span class="token string">&quot;city&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;长沙&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>dynamic设置成strict，新增age字段导致文档插入失败：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309171810481.png" alt="image-20230917181027350" style="zoom:67%;"><p>修改dynamic后再次插入文档成功</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#修改daynamic</span>
PUT /user/_mapping
<span class="token punctuation">{</span>
  <span class="token string">&quot;dynamic&quot;</span>:true
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="elaticsearch搜索技术与聚合查询" tabindex="-1"><a class="header-anchor" href="#elaticsearch搜索技术与聚合查询"><span>ElaticSearch搜索技术与聚合查询</span></a></h2><h2 id="elaticsearch高阶功能" tabindex="-1"><a class="header-anchor" href="#elaticsearch高阶功能"><span>ElaticSearch高阶功能</span></a></h2><h2 id="elaticsearch集群架构实战及其原理" tabindex="-1"><a class="header-anchor" href="#elaticsearch集群架构实战及其原理"><span>ElaticSearch集群架构实战及其原理</span></a></h2><p>链接：https://note.youdao.com/ynoteshare/index.html?id=16ca3fcfcdda46a976cfd978e20df4be&amp;type=note&amp;_time=1684856471454</p><p>为什么说ElaticSearch是一个近实时的搜索引擎？</p><h2 id="logstash与filebeat详解以及efk整合" tabindex="-1"><a class="header-anchor" href="#logstash与filebeat详解以及efk整合"><span>Logstash与FileBeat详解以及EFK整合</span></a></h2>`,133),l=[i];function p(c,o){return n(),a("div",null,l)}const d=s(e,[["render",p],["__file","index.html.vue"]]),r=JSON.parse('{"path":"/database/elatic_search/","title":"ElaticSearch","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"ElaticSearch快速入门","slug":"elaticsearch快速入门","link":"#elaticsearch快速入门","children":[{"level":3,"title":"倒排索引","slug":"倒排索引","link":"#倒排索引","children":[]},{"level":3,"title":"ElaticSearch简介","slug":"elaticsearch简介","link":"#elaticsearch简介","children":[]},{"level":3,"title":"ElaticSearch基本概念","slug":"elaticsearch基本概念","link":"#elaticsearch基本概念","children":[]},{"level":3,"title":"ES文档批量操作","slug":"es文档批量操作","link":"#es文档批量操作","children":[]}]},{"level":2,"title":"ElaticSearch高级查询语法Query DSL","slug":"elaticsearch高级查询语法query-dsl","link":"#elaticsearch高级查询语法query-dsl","children":[]},{"level":2,"title":"ElaticSearch搜索技术与聚合查询","slug":"elaticsearch搜索技术与聚合查询","link":"#elaticsearch搜索技术与聚合查询","children":[]},{"level":2,"title":"ElaticSearch高阶功能","slug":"elaticsearch高阶功能","link":"#elaticsearch高阶功能","children":[]},{"level":2,"title":"ElaticSearch集群架构实战及其原理","slug":"elaticsearch集群架构实战及其原理","link":"#elaticsearch集群架构实战及其原理","children":[]},{"level":2,"title":"Logstash与FileBeat详解以及EFK整合","slug":"logstash与filebeat详解以及efk整合","link":"#logstash与filebeat详解以及efk整合","children":[]}],"git":{"updatedTime":1720150611000,"contributors":[{"name":"jiyongchao","email":"jycoder@163.com","commits":1}]},"filePathRelative":"database/elatic_search/README.md","readingTime":{"minutes":13.56,"words":4067},"excerpt":"\\n<h2>ElaticSearch快速入门</h2>\\n<p>全文检索是指：</p>\\n<ol>\\n<li>通过一个程序扫描文本中的每一个单词，针对单词建立索引，并保存该单词在文本中的位置、以及出现的次数</li>\\n<li>用户查询时，通过之前建立好的索引来查询，将索引中单词对应的文本位置、出现的次数返回给用户，因为有了具体文本的位置，所以就可以将具体的内容读取出来了</li>\\n</ol>\\n<p>例如，在csdn中搜索elaticsearch快速入门：</p>\\n<img src=\\"https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309042317865.png\\" alt=\\"image-20230904231737762\\" style=\\"zoom: 50%;\\">"}');export{d as comp,r as data};
