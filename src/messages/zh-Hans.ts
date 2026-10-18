import type { Catalog } from './index.js';

// 后缀连接符 is always the suffix connector (MVS, NNBSP); ZWJ and ZWNJ keep
// their abbreviations, so that 连接符 never means two things.
export const zhHans: Catalog = {
  'mvs-context/misplaced':
    'MVS（U+180E）必须位于两个蒙古文字母之间（词干与后缀之间，或词干与分写的词末 a/e 之间）',
  'fvs-placement/start':
    'FVS{n}（{char}）位于文本开头——变体选择符必须紧跟在它所修饰的蒙古文字母之后',
  'fvs-placement/after-fvs':
    'FVS{n}（{char}）跟在 FVS{prevN}（{prev}）之后——变体选择符必须紧跟在它所修饰的蒙古文字母之后',
  'fvs-placement/after-char':
    'FVS{n}（{char}）跟在 {prev} 之后——变体选择符必须紧跟在它所修饰的蒙古文字母之后',
  'no-pua/one': '{count} 个私用区码位——旧式字形编码（蒙科立时代），并非可通用交换的 Unicode 蒙古文',
  'no-pua/many':
    '{count} 个私用区码位——旧式字形编码（蒙科立时代），并非可通用交换的 Unicode 蒙古文',
  'detached-suffix/verbal': '“{suffix}”（{cyrillic}）是动词词尾，始终与词干连写——请删除后缀连接符',
  'detached-suffix/formal': '在正式文件中，“{suffix}”（{cyrillic}）应与词干连写——请删除后缀连接符',
  'wrong-block/todo': '胡都木文中出现托忒文字母（{char}）',
  'wrong-block/sibe': '胡都木文中出现锡伯文字母（{char}）',
  'wrong-block/manchu': '胡都木文中出现满文字母（{char}）',
  'wrong-block/ali-gali': '胡都木文中出现阿礼嘎礼字母（{char}）',
  'wrong-block/ali-gali-lookalike': '胡都木文中出现阿礼嘎礼字母（{char}）——是否应为 {target}？',
  'zwj-zwnj/zwj':
    'ZWJ（U+200D）位于两个蒙古文字母之间——词内改变位置形式应使用 FVS1–4，而非 ZWJ；如需可见的连接笔画，请使用 nirugu（U+180A）。在词边界处用于单独选择位置形式的 ZWJ 是合法的，不予报告',
  'zwj-zwnj/zwnj':
    'ZWNJ（U+200C）紧邻蒙古文字母——在词中它会断开字母间的连接（改变位置形式应使用 FVS1–4）；在词边缘，它所选的形式与默认字形处理并无二致',
  'nnbsp-legacy/connector':
    'NNBSP（U+202F）作为后缀连接符自 Unicode 16.0 起已过时——请使用 MVS（U+180E）',
  'nnbsp-legacy/particle':
    'NNBSP（U+202F）位于以空格分写的虚词之前——这些是独立的词，应使用普通空格，而非后缀连接符',
  'compat-punctuation/vertical':
    '竖排形式（为与 GB 18030 往返转换而设）{char}——兼容字符，不应用于信息交换；请写作 {target}，竖排字形由字体提供',
  'compat-punctuation/cjk':
    'CJK 兼容形式（为与 CNS 11643 往返转换而设）{char}——兼容字符，不应用于信息交换；请写作 {target}，竖排字形由字体提供',
  'compat-punctuation/small':
    '小写变体形式（为与 CNS 11643 往返转换而设）{char}——兼容字符，不应用于信息交换；请写作 {target}，竖排字形由字体提供',
  'compat-punctuation/borrowed':
    '{char} 是借自汉语的标点——Unicode 核心规范第 13.5 节将其列为托忒文和锡伯文的标点；胡都木文应写作 {target}',
  'unknown-suffix/particle':
    '“{word}”（{cyrillic}）是独立的词，不是后缀——应使用普通空格，绝不用后缀连接符',
  'unknown-suffix/stray-fvs':
    '后缀“{suffix}”（{translit}）带有多余的 FVS——后缀连接符之后的字形由字体自动处理',
  'unknown-suffix/unknown': '未知的胡都木文后缀“{suffix}”（位于 {connector} 之后）——不在后缀词典中',
  'doubled-ae/doubled':
    '{letter}（{char}）重叠——长元音 a/e 以 γ/g 隔开书写，从不重叠，因此这通常是把西里尔文的 аа/ээ 逐字母照搬（反身领属后缀为 ᠢᠶᠠᠨ/ᠢᠶᠡᠨ；呼格是单独成词的一个 ᠠ/ᠡ）',
  'non-initial-o/later':
    'O/Ö（U+1823/U+1825）通常只出现在第一音节——后续音节用 U/Ü（U+1824/U+1826）；外来词及少数词汇例外不在此限',
  'fusable-stack/fusable':
    '“{first}” + “{second}”也可写作融合形式“{fused}”（{translit}）——两种写法都正确',
};
