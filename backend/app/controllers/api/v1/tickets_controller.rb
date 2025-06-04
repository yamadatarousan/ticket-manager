class Api::V1::TicketsController < ApplicationController
  before_action :set_ticket, only: [ :show, :update, :destroy ]

  # GET /api/v1/tickets
  def index
    @tickets = Ticket.all

    # フィルタリング
    @tickets = @tickets.by_status(params[:status]) if params[:status].present?
    @tickets = @tickets.by_priority(params[:priority]) if params[:priority].present?
    @tickets = @tickets.assigned_to_user(params[:assigned_to]) if params[:assigned_to].present?
    @tickets = @tickets.created_by_user(params[:created_by]) if params[:created_by].present?

    # ページネーション（将来的に実装可能）
    @tickets = @tickets.limit(params[:limit] || 50)
    @tickets = @tickets.offset(params[:offset] || 0)

    render json: {
      tickets: @tickets,
      meta: {
        total: Ticket.count,
        count: @tickets.count
      }
    }
  end

  # GET /api/v1/tickets/1
  def show
    render json: { ticket: @ticket }
  end

  # POST /api/v1/tickets
  def create
    @ticket = Ticket.new(ticket_params)
    @ticket.created_by = @current_user.email

    if @ticket.save
      render json: { ticket: @ticket }, status: :created
    else
      render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/tickets/1
  def update
    if @ticket.update(ticket_params)
      render json: { ticket: @ticket }
    else
      render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/tickets/1
  def destroy
    @ticket.destroy
    head :no_content
  end

  private

  def set_ticket
    @ticket = Ticket.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Ticket not found" }, status: :not_found
  end

  def ticket_params
    params.require(:ticket).permit(:title, :description, :status, :priority, :assigned_to, :created_by)
  end
end
