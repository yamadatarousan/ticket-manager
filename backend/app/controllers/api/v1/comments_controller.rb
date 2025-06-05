# ==============================================================================
# コメントコントローラー
#
# チケットに対するコメント関連のAPIエンドポイントを提供するコントローラーです。
# BacklogやRedmineのようなコメント機能を実現します。
# ==============================================================================
class Api::V1::CommentsController < ApplicationController
  before_action :set_ticket, only: [:index, :create]
  before_action :set_comment, only: [:show, :update, :destroy]

  # チケットのコメント一覧取得
  #
  # @route GET /api/v1/tickets/:ticket_id/comments
  # @param ticket_id [Integer] チケットID
  # @return [JSON] コメント一覧
  # @status 200 取得成功
  # @status 404 チケットが見つからない
  # @example レスポンス
  #   {
  #     "comments": [
  #       {
  #         "id": 1,
  #         "content": "進捗報告です",
  #         "user_email": "user@example.com",
  #         "author_name": "User",
  #         "created_at": "2024-01-01T00:00:00.000Z",
  #         "updated_at": "2024-01-01T00:00:00.000Z"
  #       }
  #     ]
  #   }
  def index
    @comments = @ticket.comments.order(:created_at)
    
    render json: {
      comments: @comments.map { |comment| comment_response(comment) }
    }
  end

  # コメント詳細取得
  #
  # @route GET /api/v1/comments/:id
  # @param id [Integer] コメントID
  # @return [JSON] コメント詳細
  # @status 200 取得成功
  # @status 404 コメントが見つからない
  def show
    render json: { comment: comment_response(@comment) }
  end

  # コメント作成
  #
  # @route POST /api/v1/tickets/:ticket_id/comments
  # @param ticket_id [Integer] チケットID
  # @param comment [Hash] コメント情報
  # @param comment[:content] [String] コメント内容（必須）
  # @return [JSON] 作成されたコメント情報
  # @status 201 作成成功
  # @status 422 バリデーションエラー
  # @example リクエスト
  #   {
  #     "comment": {
  #       "content": "作業を開始しました"
  #     }
  #   }
  def create
    @comment = @ticket.comments.build(comment_params)
    @comment.user_email = @current_user.email

    if @comment.save
      render json: { comment: comment_response(@comment) }, status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # コメント更新
  #
  # @route PATCH/PUT /api/v1/comments/:id
  # @param id [Integer] コメントID
  # @param comment [Hash] 更新するコメント情報
  # @param comment[:content] [String] コメント内容
  # @return [JSON] 更新されたコメント情報
  # @status 200 更新成功
  # @status 404 コメントが見つからない
  # @status 422 バリデーションエラー
  # @status 403 権限エラー（他ユーザーのコメント編集時）
  def update
    # 自分のコメントのみ編集可能
    unless @comment.user_email == @current_user.email || @current_user.admin?
      render json: { error: "このコメントを編集する権限がありません" }, status: :forbidden
      return
    end

    if @comment.update(comment_params)
      render json: { comment: comment_response(@comment) }
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # コメント削除
  #
  # @route DELETE /api/v1/comments/:id
  # @param id [Integer] コメントID
  # @return [void]
  # @status 204 削除成功
  # @status 404 コメントが見つからない
  # @status 403 権限エラー（他ユーザーのコメント削除時）
  def destroy
    # 自分のコメントのみ削除可能（管理者は全て削除可能）
    unless @comment.user_email == @current_user.email || @current_user.admin?
      render json: { error: "このコメントを削除する権限がありません" }, status: :forbidden
      return
    end

    @comment.destroy
    head :no_content
  end

  private

  # チケットIDからチケットを取得
  #
  # @param ticket_id [Integer] 取得するチケットのID
  # @return [Ticket] 取得したチケットオブジェクト
  # @raise [ActiveRecord::RecordNotFound] チケットが見つからない場合
  # @private
  def set_ticket
    @ticket = Ticket.find(params[:ticket_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Ticket not found" }, status: :not_found
  end

  # IDからコメントを取得
  #
  # @param id [Integer] 取得するコメントのID
  # @return [Comment] 取得したコメントオブジェクト
  # @raise [ActiveRecord::RecordNotFound] コメントが見つからない場合
  # @private
  def set_comment
    @comment = Comment.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Comment not found" }, status: :not_found
  end

  # パラメータを安全に取得
  #
  # @return [ActionController::Parameters] 許可されたパラメータ
  # @private
  def comment_params
    params.require(:comment).permit(:content)
  end

  # コメント情報をレスポンス形式に変換
  #
  # @param comment [Comment] 変換するコメントオブジェクト
  # @return [Hash] レスポンス用にフォーマットされたコメント情報
  # @private
  def comment_response(comment)
    {
      id: comment.id,
      content: comment.content,
      user_email: comment.user_email,
      author_name: comment.author_name,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }
  end
end 