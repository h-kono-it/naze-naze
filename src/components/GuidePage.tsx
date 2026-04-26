interface Props {
  onBack: () => void;
}

export function GuidePage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← 戻る
        </button>
        <h1 className="text-base font-bold text-gray-800">上手ななぜなぜ分析の進め方</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">

        {/* なぜなぜ分析とは */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            なぜなぜ分析とは
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            「なぜ？」を繰り返すことで、問題の表面的な原因ではなく<strong className="text-gray-800">根本原因</strong>を特定する手法です。トヨタ生産方式で体系化されて以来、品質改善・障害分析・プロセス改善など幅広い場面で活用されています。
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            「なぜ」を5回程度繰り返すことで、単なる対症療法ではなく再発を防ぐ本質的な改善策にたどり着けます。
          </p>
        </section>

        {/* 進め方のポイント */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            進め方のポイント
          </h2>
          <div className="space-y-4">

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 mb-1">① 事象を具体的・客観的に書く</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                「サーバーが落ちた」より「本番APIサーバーが04:12〜04:17の5分間応答不能になった」のように、<strong className="text-gray-800">いつ・どこで・何が・どの程度</strong>を含めて書くと、その後の「なぜ」がブレにくくなります。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 mb-1">② 「なぜ」は1つの原因に絞る</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                1つのノードに複数の原因を書くと因果関係が曖昧になります。原因が複数ある場合は<strong className="text-gray-800">別のブランチ</strong>に分けて掘り下げてください。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 mb-1">③ 論理的な因果を確認する</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                「A だったから、B となった」と声に出して読んで自然かどうか確かめましょう。因果文がぎこちない場合は、間にステップが抜けている可能性があります（論理の飛躍）。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 mb-1">④ 「人のせい」で止めない</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                「担当者がミスした」で止まると再発防止策が「気をつける」になりがちです。<strong className="text-gray-800">なぜミスが起きやすい仕組みになっているか</strong>まで掘り下げましょう。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 mb-1">⑤ 根本原因は「対策が打てる」レベルまで</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                「予算がない」「時間がなかった」のような変えられない前提で止まっていないか確認します。具体的なアクションに落とせる原因まで掘り下げるのが目標です。
              </p>
            </div>
          </div>
        </section>

        {/* よくある失敗 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-400 rounded-full inline-block" />
            よくある失敗パターン
          </h2>
          <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
            {[
              { bad: '「なぜ？」を無理に5回繰り返す', good: '回数にこだわらず、対策が見えたら止めてよい' },
              { bad: '結論ありきで原因を当てはめる', good: '「何が実際に起きたか」のデータや事実から出発する' },
              { bad: '「〜の可能性がある」で埋める', good: '推測と事実を区別し、推測には裏付けを取る' },
              { bad: '一人で完結させようとする', good: '現場の担当者と一緒に掘り下げると精度が上がる' },
            ].map(({ bad, good }, i) => (
              <div key={i} className={`p-4 ${i !== 0 ? 'border-t border-red-100' : ''}`}>
                <p className="text-xs font-semibold text-red-500 mb-0.5">✗ {bad}</p>
                <p className="text-xs text-gray-600 pl-3">→ {good}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 原因パターン別・問い直しTips */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
            原因パターン別・問い直しTips
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            「なぜ」が詰まったとき、原因の言葉のパターンを見て問いを立て直すヒントにしてください。
          </p>
          <div className="space-y-3">
            {[
              {
                tag: '不作為系',
                pattern: '「〜しなかった」「〜を怠った」',
                hint: '個人の意志ではなく仕組みの問題に転換する',
                question: 'なぜそれをしなくて済む・気づけない状況だったか？\nチェックリストや自動化は機能していたか？',
              },
              {
                tag: '知識不足系',
                pattern: '「〜を知らなかった」「〜を理解していなかった」',
                hint: '知識ではなく「知れる環境」の問題として捉える',
                question: 'なぜ知る機会・手段がなかったか？\nドキュメントやオンボーディングに抜けはなかったか？',
              },
              {
                tag: '制約系',
                pattern: '「時間が足りなかった」「リソースが足りなかった」',
                hint: '制約そのものではなく、制約が生まれた背景を掘る',
                question: 'なぜその制約が生まれたか？\n優先度付けや見積もりのプロセスに問題はなかったか？',
              },
              {
                tag: '思い込み系',
                pattern: '「〜だと思っていた」「確認しなかった」',
                hint: '思い込みが生まれる認知の問題ではなく、確認できなかった環境の問題として捉える',
                question: 'なぜその誤解が生まれたか？\n情報の可視化や確認フローが機能していたか？',
              },
              {
                tag: '伝達不足系',
                pattern: '「伝わっていなかった」「共有されていなかった」',
                hint: '「誰かが言わなかった」ではなく伝達の仕組みの問題に転換する',
                question: '誰が・いつ・どの手段で伝える責任を持っていたか？\n確認フローや責任の所在が明確だったか？',
              },
              {
                tag: '想定外系',
                pattern: '「想定していなかった」「予期しなかった」',
                hint: '「想定外だった」で止めず、なぜ想定できなかったかを掘る',
                question: 'なぜリスクを事前に洗い出せなかったか？\n設計レビューや障害訓練のプロセスに抜けはなかったか？',
              },
              {
                tag: '慢性化系',
                pattern: '「以前からそうだった」「ずっと問題だった」',
                hint: '問題が放置された背景こそが真因に近い',
                question: 'なぜ長期間放置されたか？\n問題を表面化・エスカレーションする仕組みが機能していたか？',
              },
            ].map(({ tag, pattern, hint, question }) => (
              <div key={tag} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                  <p className="text-sm font-semibold text-gray-800">{pattern}</p>
                </div>
                <div className="bg-amber-50/50 border-t border-amber-100 px-4 py-3">
                  <p className="text-[11px] text-amber-700 font-semibold mb-1">{hint}</p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{question}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* このツールの使い方 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
            このツールの使い方
          </h2>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: '分析を作成する',
                body: 'ホーム画面の「新規分析を作成」から分析名と発生した事象を入力します。事象がツリーの頂点（根）になります。',
              },
              {
                step: '2',
                title: '「なぜ」を追加する',
                body: 'ノードをクリックすると編集モーダルが開きます。「+ なぜ」ボタンで子ノードを追加してください。重みは「この原因が事象にどの程度影響したか」の目安として使います。',
              },
              {
                step: '3',
                title: 'ツリーを深掘りする',
                body: '「これ以上掘り下げられない」「具体的なアクションが見えた」と感じるまでなぜを繰り返します。途中でスキップしたい枝は「スキップ」フラグを立てておくと管理しやすくなります。',
              },
              {
                step: '4',
                title: '因果を検証する',
                body: '「因果検証」モードに切り替え、葉ノードの「このパスを検証する」をクリックします。根本原因から事象まで1ステップずつ「A だから B」の因果が成立するか確認し、飛躍があればマークしておきましょう。',
              },
              {
                step: '5',
                title: '飛躍を修正して完成',
                body: '「飛躍あり」にした箇所は編集モードに戻ると赤く表示されます。間に抜けているノードを追加して因果の繋がりを埋めてください。',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
