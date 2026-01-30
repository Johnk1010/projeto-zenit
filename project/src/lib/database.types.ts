// Define um tipo JSON genérico
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
// Define a estrutura do banco de dados para o Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role: 'client' | 'therapist'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role?: 'client' | 'therapist'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role?: 'client' | 'therapist'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes?: number
          price?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
