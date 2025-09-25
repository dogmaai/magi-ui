class MAGIConsensus {
  constructor() {
    this.name = 'MAGI-Central-Consensus';
  }

  // セマンティック類似性の計算（簡易版）
  calculateSimilarity(text1, text2) {
    const words1 = this.extractKeywords(text1.toLowerCase());
    const words2 = this.extractKeywords(text2.toLowerCase());
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  extractKeywords(text) {
    // ストップワードを除去してキーワードを抽出
    const stopwords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'が', 'の', 'に', 'を', 'は', 'で', 'と', 'から', 'まで'];
    
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.includes(word));
  }

  // 多数決による合意形成
  async performConsensus(responses) {
    try {
      console.log('[MAGI-Consensus] Performing semantic majority vote...');
      
      if (responses.length === 0) {
        return {
          consensus: 'No responses to analyze',
          confidence: 0.0,
          method: 'none',
          details: []
        };
      }

      // 成功した応答のみを処理
      const validResponses = responses.filter(r => r.status === 'success');
      
      if (validResponses.length === 0) {
        return {
          consensus: 'All providers failed',
          confidence: 0.0,
          method: 'error',
          details: responses
        };
      }

      if (validResponses.length === 1) {
        return {
          consensus: validResponses[0].response,
          confidence: validResponses[0].confidence,
          method: 'single',
          details: validResponses
        };
      }

      // セマンティッククラスタリング
      const clusters = this.clusterResponses(validResponses);
      
      // 最大クラスターを選択
      const majorityCluster = clusters.reduce((max, cluster) => 
        cluster.members.length > max.members.length ? cluster : max
      );

      // 合成応答を生成
      const synthesizedResponse = this.synthesizeCluster(majorityCluster);
      
      return {
        consensus: synthesizedResponse,
        confidence: this.calculateClusterConfidence(majorityCluster, validResponses.length),
        method: 'semantic_majority',
        details: {
          totalResponses: responses.length,
          validResponses: validResponses.length,
          clusters: clusters.length,
          majoritySize: majorityCluster.members.length,
          responses: responses
        }
      };
      
    } catch (error) {
      console.error('[MAGI-Consensus] Error in consensus:', error);
      return {
        consensus: `Consensus error: ${error.message}`,
        confidence: 0.0,
        method: 'error',
        details: responses
      };
    }
  }

  // 応答をクラスタリング
  clusterResponses(responses) {
    const clusters = [];
    
    for (const response of responses) {
      let addedToCluster = false;
      
      // 既存のクラスターと類似性をチェック
      for (const cluster of clusters) {
        const avgSimilarity = cluster.members.reduce((sum, member) => 
          sum + this.calculateSimilarity(response.response, member.response), 0
        ) / cluster.members.length;
        
        if (avgSimilarity > 0.3) { // しきい値
          cluster.members.push(response);
          addedToCluster = true;
          break;
        }
      }
      
      // 新しいクラスターを作成
      if (!addedToCluster) {
        clusters.push({
          id: clusters.length,
          members: [response]
        });
      }
    }
    
    return clusters;
  }

  // クラスターから合成応答を生成
  synthesizeCluster(cluster) {
    if (cluster.members.length === 1) {
      return cluster.members[0].response;
    }
    
    // 最も信頼度の高い応答をベースに合成
    const bestResponse = cluster.members.reduce((max, member) => 
      member.confidence > max.confidence ? member : max
    );
    
    const providerNames = cluster.members.map(m => m.provider).join(', ');
    
    return `[Consensus from ${providerNames}]: ${bestResponse.response}`;
  }

  // クラスターの信頼度を計算
  calculateClusterConfidence(cluster, totalResponses) {
    const avgConfidence = cluster.members.reduce((sum, member) => 
      sum + member.confidence, 0) / cluster.members.length;
    
    const majorityFactor = cluster.members.length / totalResponses;
    
    return Math.min(0.95, avgConfidence * majorityFactor * 1.2);
  }
}

module.exports = MAGIConsensus;
